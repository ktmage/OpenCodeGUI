import * as path from "node:path";
import {
  type Config,
  createOpencodeClient,
  createOpencodeServer,
  type Event,
  type FileDiff,
  type McpStatus,
  type Message,
  type Path as OpenCodePath,
  type OpencodeClient,
  type Part,
  type Provider,
  type Session,
  type ToolListItem,
} from "@opencode-ai/sdk";
import * as vscode from "vscode";

export type { Event, Session, Message, Part, Provider, McpStatus, ToolListItem, Config, OpenCodePath, FileDiff };

// provider.list() が返す生データ型
export type ProviderListResult = {
  all: Array<ProviderInfo>;
  default: Record<string, string>;
  connected: string[];
};

export type ProviderInfo = {
  id: string;
  name: string;
  env: string[];
  api?: string;
  npm?: string;
  models: Record<string, ModelInfo>;
};

export type ModelInfo = {
  id: string;
  name: string;
  release_date: string;
  attachment: boolean;
  reasoning: boolean;
  temperature: boolean;
  tool_call: boolean;
  cost?: {
    input: number;
    output: number;
    cache_read?: number;
    cache_write?: number;
  };
  limit: { context: number; output: number };
  status?: "alpha" | "beta" | "deprecated";
  experimental?: boolean;
  options: Record<string, unknown>;
};

type EventListener = (event: Event) => void;

/**
 * OpenCode サーバーへの接続を一元管理するモジュール。
 * Webview や他のコンポーネントから直接 SDK を触らず、このクラスを経由する。
 */
export class OpenCodeConnection {
  private client: OpencodeClient | undefined;
  private server: { url: string; close(): void } | undefined;
  private sseAbortController: AbortController | undefined;
  private listeners: Set<EventListener> = new Set();
  public workspaceFolder: string | undefined;

  get serverUrl(): string | undefined {
    return this.server?.url;
  }

  async connect(): Promise<void> {
    // ポート 0 を指定し、OS に空きポートを自動割り当てさせる。
    // 固定ポートだと前回のデバッグセッションで残ったプロセスと競合する。
    const server = await createOpencodeServer({ port: 0 });
    this.server = server;
    this.client = createOpencodeClient({
      baseUrl: server.url,
    });
    this.subscribeToEvents();
  }

  private async subscribeToEvents(): Promise<void> {
    const client = this.requireClient();
    // 既存のストリームを閉じてから再購読する
    this.sseAbortController?.abort();
    this.sseAbortController = new AbortController();
    const result = await client.event.subscribe({
      signal: this.sseAbortController.signal,
    });
    // SSE ストリームからイベントを読み取り、リスナーに配信する
    (async () => {
      try {
        for await (const event of result.stream) {
          for (const listener of this.listeners) {
            listener(event as Event);
          }
        }
      } catch (error) {
        // AbortError はストリームの正常終了
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      }
    })();
  }

  /** SSE ストリームを再接続する（config 変更後など） */
  async resubscribeEvents(): Promise<void> {
    await this.subscribeToEvents();
  }

  onEvent(listener: EventListener): vscode.Disposable {
    this.listeners.add(listener);
    return new vscode.Disposable(() => {
      this.listeners.delete(listener);
    });
  }

  // --- Session API ---

  async listSessions(): Promise<Session[]> {
    const client = this.requireClient();
    const response = await client.session.list();
    return response.data!;
  }

  async createSession(title?: string): Promise<Session> {
    const client = this.requireClient();
    const response = await client.session.create({
      body: { title },
    });
    return response.data!;
  }

  async getSession(id: string): Promise<Session> {
    const client = this.requireClient();
    const response = await client.session.get({
      path: { id },
    });
    return response.data!;
  }

  async deleteSession(id: string): Promise<void> {
    const client = this.requireClient();
    await client.session.delete({
      path: { id },
    });
  }

  // --- Message API ---

  async getMessages(sessionId: string): Promise<Array<{ info: Message; parts: Part[] }>> {
    const client = this.requireClient();
    const response = await client.session.messages({
      path: { id: sessionId },
    });
    return response.data!;
  }

  /**
   * 非同期でメッセージを送信する。
   * 応答は SSE イベントストリーム経由で配信される。
   */
  async sendMessage(
    sessionId: string,
    text: string,
    model?: { providerID: string; modelID: string },
    files?: Array<{ filePath: string; fileName: string }>,
  ): Promise<void> {
    const client = this.requireClient();
    const parts: Array<{ type: "text"; text: string } | { type: "file"; mime: string; url: string; filename: string }> =
      [{ type: "text", text }];
    if (files) {
      for (const file of files) {
        // filePath はワークスペース相対パス。cwd 基準で絶対パスに変換する。
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
    await client.session.promptAsync({
      path: { id: sessionId },
      body: {
        parts,
        model,
      },
    });
  }

  async abortSession(sessionId: string): Promise<void> {
    const client = this.requireClient();
    await client.session.abort({
      path: { id: sessionId },
    });
  }

  // --- Shell API ---

  async executeShell(
    sessionId: string,
    command: string,
    model?: { providerID: string; modelID: string },
  ): Promise<void> {
    const client = this.requireClient();
    await client.session.shell({
      path: { id: sessionId },
      body: { agent: "default", command, model },
    });
  }

  // --- Provider API ---

  async getProviders(): Promise<{ providers: Provider[]; default: Record<string, string> }> {
    const client = this.requireClient();
    const response = await client.config.providers();
    return response.data!;
  }

  async listAllProviders(): Promise<ProviderListResult> {
    const client = this.requireClient();
    const response = await client.provider.list();
    return response.data!;
  }

  // --- Permission API ---

  async replyPermission(
    sessionId: string,
    permissionId: string,
    response: "once" | "always" | "reject",
  ): Promise<void> {
    const client = this.requireClient();
    await client.postSessionIdPermissionsPermissionId({
      path: { id: sessionId, permissionID: permissionId },
      body: { response },
    });
  }

  // --- Session Diff API ---

  async getSessionDiff(sessionId: string): Promise<FileDiff[]> {
    const client = this.requireClient();
    const response = await client.session.diff({
      path: { id: sessionId },
    });
    return response.data!;
  }

  // --- Revert API ---

  async revertSession(sessionId: string, messageID: string): Promise<Session> {
    const client = this.requireClient();
    const response = await client.session.revert({
      path: { id: sessionId },
      body: { messageID },
    });
    return response.data!;
  }

  // --- Summarize API ---

  async summarizeSession(sessionId: string, model?: { providerID: string; modelID: string }): Promise<void> {
    const client = this.requireClient();
    await client.session.summarize({
      path: { id: sessionId },
      body: model,
    });
  }

  // --- MCP API ---

  async getMcpStatus(): Promise<Record<string, McpStatus>> {
    const client = this.requireClient();
    const response = await client.mcp.status();
    return response.data!;
  }

  async connectMcp(name: string): Promise<void> {
    const client = this.requireClient();
    await client.mcp.connect({ path: { name } });
  }

  async disconnectMcp(name: string): Promise<void> {
    const client = this.requireClient();
    await client.mcp.disconnect({ path: { name } });
  }

  // --- Tool API ---

  async getToolIds(): Promise<string[]> {
    const client = this.requireClient();
    const response = await client.tool.ids();
    return response.data!;
  }

  // --- Config API ---

  async getConfig(): Promise<Config> {
    const client = this.requireClient();
    const response = await client.config.get();
    return response.data!;
  }

  async updateConfig(config: Partial<Config>): Promise<void> {
    const client = this.requireClient();
    await client.config.update({ body: config });
  }

  // --- Path API ---

  async getPath(): Promise<OpenCodePath> {
    const client = this.requireClient();
    const response = await client.path.get();
    return response.data!;
  }

  // --- Lifecycle ---

  disconnect(): void {
    this.sseAbortController?.abort();
    this.sseAbortController = undefined;
    this.server?.close();
    this.server = undefined;
    this.client = undefined;
    this.listeners.clear();
  }

  private requireClient(): OpencodeClient {
    if (!this.client) {
      throw new Error("OpenCode client is not connected. Call connect() first.");
    }
    return this.client;
  }
}
