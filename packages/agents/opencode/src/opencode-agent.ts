/**
 * @opencodegui/agent-opencode - OpenCodeAgent
 *
 * Implements the IAgent interface from @opencodegui/core, wrapping the
 * @opencode-ai/sdk to communicate with an OpenCode server.
 *
 * This is a direct port of the original `opencode-client.ts` (OpenCodeConnection),
 * adapted to the IAgent contract with SDK→domain type conversion via mappers.
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createOpencodeClient, createOpencodeServer, type Event, type OpencodeClient } from "@opencode-ai/sdk/v2";
import type {
  AgentCapabilities,
  AgentEvent,
  AgentInfo,
  AllProvidersData,
  AppConfig,
  AppPaths,
  ChatMessageWithParts,
  ChatSession,
  Disposable,
  FileDiff,
  IAgent,
  McpStatus,
  ModelRef,
  PermissionResponse,
  ProviderInfo,
  QuestionAnswer,
  SendMessageOptions,
  TodoItem,
  ToolListItem,
} from "@opencodegui/core";
import {
  mapAgents,
  mapAllProvidersData,
  mapConfig,
  mapEvent,
  mapFileDiffs,
  mapMcpStatus,
  mapMessagesWithParts,
  mapPath,
  mapProviders,
  mapSession,
  mapSessions,
  mapTodos,
  mapToolIds,
} from "./mappers";

type EventHandler = (event: AgentEvent) => void;

export class OpenCodeAgent implements IAgent {
  private client: OpencodeClient | undefined;
  private server: { url: string; close(): void } | undefined;
  private sseAbortController: AbortController | undefined;
  private listeners: Set<EventHandler> = new Set();
  public workspaceFolder: string | undefined;

  // --- Capability declaration ---

  getCapabilities(): AgentCapabilities {
    return {
      sessionDelete: true,
      sessionFork: true,
      sessionRevert: true,
      sessionShare: true,
      sessionSummarize: true,
      sessionDiff: true,
      todo: true,
      multiProvider: true,
      permission: true,
      question: true,
      mcp: true,
      subAgent: true,
      shell: true,
      config: true,
    };
  }

  // --- Lifecycle ---

  async connect(): Promise<void> {
    // Port 0: let OS assign a free port to avoid conflicts
    const server = await createOpencodeServer({ port: 0 });
    this.server = server;
    this.client = createOpencodeClient({
      baseUrl: server.url,
    });
    this.subscribeToEvents();
  }

  disconnect(): void {
    this.sseAbortController?.abort();
    this.sseAbortController = undefined;
    this.server?.close();
    this.server = undefined;
    this.client = undefined;
    this.listeners.clear();
  }

  // --- Event subscription ---

  onEvent(handler: (event: AgentEvent) => void): Disposable {
    this.listeners.add(handler);
    return {
      dispose: () => {
        this.listeners.delete(handler);
      },
    };
  }

  /** Resubscribe to SSE stream (e.g. after config change) */
  async resubscribeEvents(): Promise<void> {
    await this.subscribeToEvents();
  }

  private async subscribeToEvents(): Promise<void> {
    const client = this.requireClient();
    // Abort existing stream before resubscribing
    this.sseAbortController?.abort();
    this.sseAbortController = new AbortController();
    const result = await client.event.subscribe(undefined, {
      signal: this.sseAbortController.signal,
    });
    // Read SSE stream and dispatch to listeners
    (async () => {
      try {
        for await (const event of result.stream) {
          const mapped = mapEvent(event as Event);
          for (const listener of this.listeners) {
            listener(mapped);
          }
        }
      } catch (error) {
        // AbortError is normal stream termination
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      }
    })();
  }

  // --- Sessions (common) ---

  async listSessions(): Promise<ChatSession[]> {
    const client = this.requireClient();
    const response = await client.session.list();
    return mapSessions(response.data!);
  }

  async createSession(title?: string): Promise<ChatSession> {
    const client = this.requireClient();
    const response = await client.session.create({
      title,
    });
    return mapSession(response.data!);
  }

  async getSession(id: string): Promise<ChatSession> {
    const client = this.requireClient();
    const response = await client.session.get({
      sessionID: id,
    });
    return mapSession(response.data!);
  }

  // --- Sessions (capabilities-dependent) ---

  async deleteSession(id: string): Promise<void> {
    const client = this.requireClient();
    await client.session.delete({
      sessionID: id,
    });
  }

  async forkSession(sessionId: string, messageId?: string): Promise<ChatSession> {
    const client = this.requireClient();
    const response = await client.session.fork({
      sessionID: sessionId,
      messageID: messageId,
    });
    return mapSession(response.data!);
  }

  async revertSession(sessionId: string, messageId: string): Promise<ChatSession> {
    const client = this.requireClient();
    const response = await client.session.revert({
      sessionID: sessionId,
      messageID: messageId,
    });
    return mapSession(response.data!);
  }

  async unrevertSession(sessionId: string): Promise<ChatSession> {
    const client = this.requireClient();
    const response = await client.session.unrevert({
      sessionID: sessionId,
    });
    return mapSession(response.data!);
  }

  async summarizeSession(sessionId: string, model?: ModelRef): Promise<void> {
    const client = this.requireClient();
    await client.session.summarize({
      sessionID: sessionId,
      providerID: model?.providerID,
      modelID: model?.modelID,
    });
  }

  async shareSession(sessionId: string): Promise<ChatSession> {
    const client = this.requireClient();
    const response = await client.session.share({
      sessionID: sessionId,
    });
    return mapSession(response.data!);
  }

  async unshareSession(sessionId: string): Promise<ChatSession> {
    const client = this.requireClient();
    const response = await client.session.unshare({
      sessionID: sessionId,
    });
    return mapSession(response.data!);
  }

  // --- Messages ---

  async getMessages(sessionId: string): Promise<ChatMessageWithParts[]> {
    const client = this.requireClient();
    const response = await client.session.messages({
      sessionID: sessionId,
    });
    return mapMessagesWithParts(response.data!);
  }

  async sendMessage(sessionId: string, text: string, options?: SendMessageOptions): Promise<void> {
    const client = this.requireClient();
    const parts: Array<
      | { type: "text"; text: string }
      | { type: "file"; mime: string; url: string; filename: string }
      | { type: "agent"; name: string }
    > = [{ type: "text", text }];

    if (options?.files) {
      for (const file of options.files) {
        // filePath is workspace-relative; resolve to absolute via cwd
        const absPath = path.isAbsolute(file.filePath)
          ? file.filePath
          : path.resolve(this.workspaceFolder ?? ".", file.filePath);
        parts.push({
          type: "file",
          mime: "text/plain",
          url: `file://${absPath}`,
          filename: file.fileName,
        });
      }
    }

    // @agent mention triggers sub-agent invocation via AgentPartInput
    if (options?.agent) {
      parts.push({ type: "agent", name: options.agent });
    }

    await client.session.promptAsync({
      sessionID: sessionId,
      parts,
      model: options?.model,
      agent: options?.primaryAgent,
    });
  }

  async abortSession(sessionId: string): Promise<void> {
    const client = this.requireClient();
    await client.session.abort({
      sessionID: sessionId,
    });
  }

  // --- Shell ---

  async executeShell(sessionId: string, command: string, model?: ModelRef): Promise<void> {
    const client = this.requireClient();
    await client.session.shell({
      sessionID: sessionId,
      agent: "default",
      command,
      model,
    });
  }

  // --- Providers & models ---

  async getProviders(): Promise<{
    providers: ProviderInfo[];
    default: Record<string, string>;
  }> {
    const client = this.requireClient();
    const response = await client.config.providers();
    const data = response.data!;
    return {
      providers: mapProviders(data.providers),
      default: data.default,
    };
  }

  async listAllProviders(): Promise<AllProvidersData> {
    const client = this.requireClient();
    const response = await client.provider.list();
    return mapAllProvidersData(response.data!);
  }

  // --- Agent list ---

  async getAgents(): Promise<AgentInfo[]> {
    const client = this.requireClient();
    const response = await client.app.agents();
    return mapAgents(response.data!);
  }

  async getChildSessions(sessionId: string): Promise<ChatSession[]> {
    const client = this.requireClient();
    const response = await client.session.children({
      sessionID: sessionId,
    });
    return mapSessions(response.data!);
  }

  // --- Permissions ---

  async replyPermission(sessionId: string, permissionId: string, response: PermissionResponse): Promise<void> {
    const client = this.requireClient();
    await client.permission.reply({
      requestID: permissionId,
      reply: response as "once" | "always" | "reject",
    });
  }

  // --- Questions ---

  async replyQuestion(requestId: string, answers: QuestionAnswer[]): Promise<void> {
    const client = this.requireClient();
    await client.question.reply({
      requestID: requestId,
      answers,
    });
  }

  async rejectQuestion(requestId: string): Promise<void> {
    const client = this.requireClient();
    await client.question.reject({
      requestID: requestId,
    });
  }

  // --- Session metadata ---

  async getSessionDiff(sessionId: string): Promise<FileDiff[]> {
    const client = this.requireClient();
    const response = await client.session.diff({
      sessionID: sessionId,
    });
    return mapFileDiffs(response.data!);
  }

  async getSessionTodos(sessionId: string): Promise<TodoItem[]> {
    const client = this.requireClient();
    const response = await client.session.todo({
      sessionID: sessionId,
    });
    return mapTodos(response.data!);
  }

  // --- Config ---

  async getConfig(): Promise<AppConfig> {
    const client = this.requireClient();
    const response = await client.config.get();
    return mapConfig(response.data!);
  }

  async updateConfig(config: Partial<AppConfig>): Promise<void> {
    const client = this.requireClient();
    await client.config.update({ config: config as Record<string, unknown> });
  }

  async getPath(): Promise<AppPaths> {
    const client = this.requireClient();
    const response = await client.path.get();
    return mapPath(response.data!);
  }

  // --- MCP ---

  async getMcpStatus(): Promise<McpStatus> {
    const client = this.requireClient();
    const response = await client.mcp.status();
    return mapMcpStatus(response.data!);
  }

  async connectMcp(server: string): Promise<void> {
    const client = this.requireClient();
    await client.mcp.connect({ name: server });
  }

  async disconnectMcp(server: string): Promise<void> {
    const client = this.requireClient();
    await client.mcp.disconnect({ name: server });
  }

  // --- Tools ---

  async getToolIds(): Promise<ToolListItem[]> {
    const client = this.requireClient();
    const response = await client.tool.ids();
    return mapToolIds(response.data!);
  }

  // --- Server URL ---

  getServerUrl(): string | undefined {
    return this.server?.url;
  }

  // --- Model management (setModel) ---

  /**
   * setModel is an OpenCode-specific workaround: the config.update API doesn't
   * persist model changes, so we edit the opencode.json config file directly.
   */
  async setModel(model: string): Promise<void> {
    const paths = await this.getPath();
    const configFilePath = path.join(paths.config, "opencode.json");
    let configJson: Record<string, unknown> = {};
    try {
      const raw = await fs.readFile(configFilePath, "utf-8");
      configJson = JSON.parse(raw);
    } catch {
      // File may not exist yet — start from empty object
    }
    configJson.model = model;
    await fs.mkdir(path.dirname(configFilePath), { recursive: true });
    await fs.writeFile(configFilePath, `${JSON.stringify(configJson, null, 2)}\n`);
  }

  // --- Private ---

  private requireClient(): OpencodeClient {
    if (!this.client) {
      throw new Error("OpenCode client is not connected. Call connect() first.");
    }
    return this.client;
  }
}
