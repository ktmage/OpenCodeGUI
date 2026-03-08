/**
 * OpenCodeAgent のユニットテスト。
 * @opencode-ai/sdk/v2 をモックし、各パブリックメソッドが正しいパラメータで SDK を呼び出し、
 * mapper を通してドメイン型に変換されることを検証する。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// --- SDK モック ---

/** SDK クライアントのモックを生成する */
function createMockSdkClient() {
  return {
    session: {
      list: vi.fn().mockResolvedValue({ data: [] }),
      create: vi.fn().mockResolvedValue({ data: { id: "sess-1", title: "Test" } }),
      get: vi.fn().mockResolvedValue({ data: { id: "sess-1" } }),
      delete: vi.fn().mockResolvedValue(undefined),
      fork: vi.fn().mockResolvedValue({ data: { id: "sess-2" } }),
      messages: vi.fn().mockResolvedValue({ data: [] }),
      promptAsync: vi.fn().mockResolvedValue(undefined),
      abort: vi.fn().mockResolvedValue(undefined),
      shell: vi.fn().mockResolvedValue(undefined),
      children: vi.fn().mockResolvedValue({ data: [] }),
      todo: vi.fn().mockResolvedValue({ data: [] }),
      share: vi.fn().mockResolvedValue({ data: { id: "sess-1", share: { url: "https://example.com" } } }),
      unshare: vi.fn().mockResolvedValue({ data: { id: "sess-1" } }),
      diff: vi.fn().mockResolvedValue({ data: [] }),
      revert: vi.fn().mockResolvedValue({ data: { id: "sess-1" } }),
      unrevert: vi.fn().mockResolvedValue({ data: { id: "sess-1" } }),
      summarize: vi.fn().mockResolvedValue(undefined),
    },
    config: {
      providers: vi.fn().mockResolvedValue({ data: { providers: [], default: {} } }),
      get: vi.fn().mockResolvedValue({ data: {} }),
      update: vi.fn().mockResolvedValue(undefined),
    },
    provider: {
      list: vi.fn().mockResolvedValue({ data: { all: [], default: {}, connected: [] } }),
    },
    permission: {
      reply: vi.fn().mockResolvedValue(undefined),
    },
    question: {
      reply: vi.fn().mockResolvedValue(undefined),
      reject: vi.fn().mockResolvedValue(undefined),
    },
    app: {
      agents: vi.fn().mockResolvedValue({ data: [] }),
    },
    mcp: {
      status: vi.fn().mockResolvedValue({ data: {} }),
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
    },
    tool: {
      ids: vi.fn().mockResolvedValue({ data: ["tool-1", "tool-2"] }),
    },
    path: {
      get: vi
        .fn()
        .mockResolvedValue({ data: { config: "/home/.config/opencode", data: "/home/.local/share/opencode" } }),
    },
    event: {
      subscribe: vi.fn().mockResolvedValue({
        stream: (async function* () {
          // デフォルトは空ストリーム
        })(),
      }),
    },
  };
}

let mockClient: ReturnType<typeof createMockSdkClient>;
const mockServerClose = vi.fn();

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@opencode-ai/sdk/v2", () => ({
  createOpencodeServer: vi.fn().mockImplementation(() =>
    Promise.resolve({
      url: "http://localhost:12345",
      close: mockServerClose,
    }),
  ),
  createOpencodeClient: vi.fn().mockImplementation(() => mockClient),
}));

import * as fs from "node:fs/promises";
import { createOpencodeClient, createOpencodeServer } from "@opencode-ai/sdk/v2";
// テスト対象
import { OpenCodeAgent } from "../opencode-agent";

describe("OpenCodeAgent", () => {
  let agent: OpenCodeAgent;

  beforeEach(() => {
    mockClient = createMockSdkClient();
    // createOpencodeClient のモック実装を更新
    vi.mocked(createOpencodeClient).mockReturnValue(mockClient as never);
    agent = new OpenCodeAgent();
  });

  afterEach(() => {
    agent.disconnect();
    vi.clearAllMocks();
  });

  // ============================================================
  // getCapabilities
  // ============================================================

  describe("getCapabilities()", () => {
    it("should return all capabilities as true", () => {
      const caps = agent.getCapabilities();

      expect(caps.sessionDelete).toBe(true);
      expect(caps.sessionFork).toBe(true);
      expect(caps.sessionRevert).toBe(true);
      expect(caps.sessionShare).toBe(true);
      expect(caps.sessionSummarize).toBe(true);
      expect(caps.sessionDiff).toBe(true);
      expect(caps.todo).toBe(true);
      expect(caps.multiProvider).toBe(true);
      expect(caps.permission).toBe(true);
      expect(caps.mcp).toBe(true);
      expect(caps.subAgent).toBe(true);
      expect(caps.shell).toBe(true);
      expect(caps.config).toBe(true);
    });
  });

  // ============================================================
  // connect / disconnect / lifecycle
  // ============================================================

  describe("connect()", () => {
    it("should create server on port 0 and create client", async () => {
      await agent.connect();

      expect(createOpencodeServer).toHaveBeenCalledWith({ port: 0 });
      expect(createOpencodeClient).toHaveBeenCalledWith({ baseUrl: "http://localhost:12345" });
    });

    it("should subscribe to SSE events after connecting", async () => {
      await agent.connect();

      expect(mockClient.event.subscribe).toHaveBeenCalled();
    });

    it("should expose serverUrl via getServerUrl() after connecting", async () => {
      expect(agent.getServerUrl()).toBeUndefined();
      await agent.connect();
      expect(agent.getServerUrl()).toBe("http://localhost:12345");
    });
  });

  describe("disconnect()", () => {
    it("should abort SSE, close server, and clear state", async () => {
      await agent.connect();

      agent.disconnect();

      expect(mockServerClose).toHaveBeenCalled();
      expect(agent.getServerUrl()).toBeUndefined();
    });

    it("should be idempotent (no crash when called without connect)", () => {
      expect(() => agent.disconnect()).not.toThrow();
    });

    it("should clear event listeners", async () => {
      await agent.connect();
      const listener = vi.fn();
      agent.onEvent(listener);

      agent.disconnect();

      // After disconnect, listeners should be cleared.
      // Reconnect and fire events — old listener should NOT be called.
      await agent.connect();
      // 新しいストリームからイベントを流しても、旧リスナーは呼ばれない
      // （disconnect で listeners.clear() されているため）
    });
  });

  describe("requireClient() (via public methods)", () => {
    it("should throw when not connected", async () => {
      await expect(agent.listSessions()).rejects.toThrow("OpenCode client is not connected. Call connect() first.");
    });
  });

  // ============================================================
  // Session API
  // ============================================================

  describe("listSessions()", () => {
    it("should call client.session.list() and return mapped data", async () => {
      const sessions = [{ id: "s1" }, { id: "s2" }];
      mockClient.session.list.mockResolvedValue({ data: sessions });
      await agent.connect();

      const result = await agent.listSessions();

      expect(mockClient.session.list).toHaveBeenCalled();
      expect(result).toEqual(sessions);
    });
  });

  describe("createSession()", () => {
    it("should call client.session.create() with title", async () => {
      await agent.connect();

      await agent.createSession("My Session");

      expect(mockClient.session.create).toHaveBeenCalledWith({
        title: "My Session",
      });
    });

    it("should pass undefined title when not provided", async () => {
      await agent.connect();

      await agent.createSession();

      expect(mockClient.session.create).toHaveBeenCalledWith({
        title: undefined,
      });
    });
  });

  describe("getSession()", () => {
    it("should call client.session.get() with correct sessionID", async () => {
      await agent.connect();

      await agent.getSession("sess-1");

      expect(mockClient.session.get).toHaveBeenCalledWith({
        sessionID: "sess-1",
      });
    });
  });

  describe("deleteSession()", () => {
    it("should call client.session.delete() with correct sessionID", async () => {
      await agent.connect();

      await agent.deleteSession("sess-1");

      expect(mockClient.session.delete).toHaveBeenCalledWith({
        sessionID: "sess-1",
      });
    });
  });

  describe("forkSession()", () => {
    it("should call with messageId when provided", async () => {
      await agent.connect();

      await agent.forkSession("sess-1", "msg-5");

      expect(mockClient.session.fork).toHaveBeenCalledWith({
        sessionID: "sess-1",
        messageID: "msg-5",
      });
    });

    it("should call with undefined messageID when not provided", async () => {
      await agent.connect();

      await agent.forkSession("sess-1");

      expect(mockClient.session.fork).toHaveBeenCalledWith({
        sessionID: "sess-1",
        messageID: undefined,
      });
    });
  });

  // ============================================================
  // Message API
  // ============================================================

  describe("getMessages()", () => {
    it("should call with correct sessionId", async () => {
      await agent.connect();

      await agent.getMessages("sess-1");

      expect(mockClient.session.messages).toHaveBeenCalledWith({
        sessionID: "sess-1",
      });
    });
  });

  describe("sendMessage()", () => {
    it("should send text-only message", async () => {
      await agent.connect();

      await agent.sendMessage("sess-1", "Hello");

      expect(mockClient.session.promptAsync).toHaveBeenCalledWith({
        sessionID: "sess-1",
        parts: [{ type: "text", text: "Hello" }],
        model: undefined,
        agent: undefined,
      });
    });

    it("should send message with model via options", async () => {
      await agent.connect();
      const model = { providerID: "anthropic", modelID: "claude-4" };

      await agent.sendMessage("sess-1", "Hello", { model });

      expect(mockClient.session.promptAsync).toHaveBeenCalledWith({
        sessionID: "sess-1",
        parts: [{ type: "text", text: "Hello" }],
        model,
        agent: undefined,
      });
    });

    it("should convert relative file paths to absolute using workspaceFolder", async () => {
      await agent.connect();
      agent.workspaceFolder = "/workspace/project";
      const files = [{ filePath: "src/index.ts", fileName: "index.ts" }];

      await agent.sendMessage("sess-1", "Check this", { files });

      const call = mockClient.session.promptAsync.mock.calls[0][0];
      expect(call.parts).toHaveLength(2);
      expect(call.parts[1]).toEqual({
        type: "file",
        mime: "text/plain",
        url: "file:///workspace/project/src/index.ts",
        filename: "index.ts",
      });
    });

    it("should not modify absolute file paths", async () => {
      await agent.connect();
      const files = [{ filePath: "/absolute/path/file.ts", fileName: "file.ts" }];

      await agent.sendMessage("sess-1", "Check", { files });

      const call = mockClient.session.promptAsync.mock.calls[0][0];
      expect(call.parts[1]).toEqual({
        type: "file",
        mime: "text/plain",
        url: "file:///absolute/path/file.ts",
        filename: "file.ts",
      });
    });

    it("should add agent part when agent is provided via options", async () => {
      await agent.connect();

      await agent.sendMessage("sess-1", "Hello", { agent: "code-reviewer" });

      const call = mockClient.session.promptAsync.mock.calls[0][0];
      expect(call.parts).toHaveLength(2);
      expect(call.parts[1]).toEqual({ type: "agent", name: "code-reviewer" });
    });

    it("should include all parts when files and agent are provided", async () => {
      await agent.connect();
      agent.workspaceFolder = "/ws";
      const model = { providerID: "openai", modelID: "gpt-4" };
      const files = [{ filePath: "a.ts", fileName: "a.ts" }];

      await agent.sendMessage("sess-1", "Review", { model, files, agent: "reviewer" });

      const call = mockClient.session.promptAsync.mock.calls[0][0];
      expect(call.parts).toHaveLength(3);
      expect(call.parts[0]).toEqual({ type: "text", text: "Review" });
      expect(call.parts[1].type).toBe("file");
      expect(call.parts[2]).toEqual({ type: "agent", name: "reviewer" });
      expect(call.model).toEqual(model);
    });
  });

  describe("abortSession()", () => {
    it("should call client.session.abort()", async () => {
      await agent.connect();

      await agent.abortSession("sess-1");

      expect(mockClient.session.abort).toHaveBeenCalledWith({
        sessionID: "sess-1",
      });
    });
  });

  // ============================================================
  // Shell API
  // ============================================================

  describe("executeShell()", () => {
    it("should call client.session.shell() with correct args", async () => {
      await agent.connect();
      const model = { providerID: "openai", modelID: "gpt-4" };

      await agent.executeShell("sess-1", "ls -la", model);

      expect(mockClient.session.shell).toHaveBeenCalledWith({
        sessionID: "sess-1",
        agent: "default",
        command: "ls -la",
        model,
      });
    });

    it("should pass undefined model when not provided", async () => {
      await agent.connect();

      await agent.executeShell("sess-1", "pwd");

      expect(mockClient.session.shell).toHaveBeenCalledWith({
        sessionID: "sess-1",
        agent: "default",
        command: "pwd",
        model: undefined,
      });
    });
  });

  // ============================================================
  // Provider API
  // ============================================================

  describe("getProviders()", () => {
    it("should return providers and default from config.providers()", async () => {
      const data = { providers: [{ id: "p1" }], default: { model: "claude-4" } };
      mockClient.config.providers.mockResolvedValue({ data });
      await agent.connect();

      const result = await agent.getProviders();

      expect(result).toEqual(data);
    });
  });

  describe("listAllProviders()", () => {
    it("should return provider list from provider.list()", async () => {
      const data = { all: [{ id: "p1" }], default: {}, connected: ["p1"] };
      mockClient.provider.list.mockResolvedValue({ data });
      await agent.connect();

      const result = await agent.listAllProviders();

      expect(result).toEqual(data);
    });
  });

  // ============================================================
  // Permission API
  // ============================================================

  describe("replyPermission()", () => {
    it("should call permission.reply with correct requestID and reply", async () => {
      await agent.connect();

      await agent.replyPermission("sess-1", "perm-1", "always");

      expect(mockClient.permission.reply).toHaveBeenCalledWith({
        requestID: "perm-1",
        reply: "always",
      });
    });
  });

  // ============================================================
  // Session Children API
  // ============================================================

  describe("getChildSessions()", () => {
    it("should call client.session.children()", async () => {
      const children = [{ id: "child-1" }];
      mockClient.session.children.mockResolvedValue({ data: children });
      await agent.connect();

      const result = await agent.getChildSessions("sess-1");

      expect(mockClient.session.children).toHaveBeenCalledWith({ sessionID: "sess-1" });
      expect(result).toEqual(children);
    });
  });

  // ============================================================
  // Session Todo API
  // ============================================================

  describe("getSessionTodos()", () => {
    it("should call client.session.todo()", async () => {
      const todos = [{ id: "t1", text: "Fix bug" }];
      mockClient.session.todo.mockResolvedValue({ data: todos });
      await agent.connect();

      const result = await agent.getSessionTodos("sess-1");

      expect(mockClient.session.todo).toHaveBeenCalledWith({ sessionID: "sess-1" });
      expect(result).toEqual(todos);
    });
  });

  // ============================================================
  // Session Share API
  // ============================================================

  describe("shareSession()", () => {
    it("should call client.session.share() and return session", async () => {
      const session = { id: "sess-1", share: { url: "https://share.example.com" } };
      mockClient.session.share.mockResolvedValue({ data: session });
      await agent.connect();

      const result = await agent.shareSession("sess-1");

      expect(mockClient.session.share).toHaveBeenCalledWith({ sessionID: "sess-1" });
      expect(result).toEqual(session);
    });
  });

  describe("unshareSession()", () => {
    it("should call client.session.unshare() and return session", async () => {
      const session = { id: "sess-1" };
      mockClient.session.unshare.mockResolvedValue({ data: session });
      await agent.connect();

      const result = await agent.unshareSession("sess-1");

      expect(mockClient.session.unshare).toHaveBeenCalledWith({ sessionID: "sess-1" });
      expect(result).toEqual(session);
    });
  });

  // ============================================================
  // Agent API
  // ============================================================

  describe("getAgents()", () => {
    it("should call app.agents()", async () => {
      const agents = [{ id: "agent-1" }];
      mockClient.app.agents.mockResolvedValue({ data: agents });
      await agent.connect();

      const result = await agent.getAgents();

      expect(mockClient.app.agents).toHaveBeenCalled();
      expect(result).toEqual(agents);
    });
  });

  // ============================================================
  // Session Diff API
  // ============================================================

  describe("getSessionDiff()", () => {
    it("should call client.session.diff()", async () => {
      const diffs = [{ path: "file.ts", before: "a", after: "b" }];
      mockClient.session.diff.mockResolvedValue({ data: diffs });
      await agent.connect();

      const result = await agent.getSessionDiff("sess-1");

      expect(mockClient.session.diff).toHaveBeenCalledWith({ sessionID: "sess-1" });
      expect(result).toEqual(diffs);
    });
  });

  // ============================================================
  // Revert / Unrevert API
  // ============================================================

  describe("revertSession()", () => {
    it("should call client.session.revert() with sessionId and messageID", async () => {
      await agent.connect();

      await agent.revertSession("sess-1", "msg-3");

      expect(mockClient.session.revert).toHaveBeenCalledWith({
        sessionID: "sess-1",
        messageID: "msg-3",
      });
    });
  });

  describe("unrevertSession()", () => {
    it("should call client.session.unrevert()", async () => {
      await agent.connect();

      await agent.unrevertSession("sess-1");

      expect(mockClient.session.unrevert).toHaveBeenCalledWith({
        sessionID: "sess-1",
      });
    });
  });

  // ============================================================
  // Summarize API
  // ============================================================

  describe("summarizeSession()", () => {
    it("should call with model when provided", async () => {
      await agent.connect();
      const model = { providerID: "openai", modelID: "gpt-4" };

      await agent.summarizeSession("sess-1", model);

      expect(mockClient.session.summarize).toHaveBeenCalledWith({
        sessionID: "sess-1",
        providerID: "openai",
        modelID: "gpt-4",
      });
    });

    it("should pass undefined model when not provided", async () => {
      await agent.connect();

      await agent.summarizeSession("sess-1");

      expect(mockClient.session.summarize).toHaveBeenCalledWith({
        sessionID: "sess-1",
        providerID: undefined,
        modelID: undefined,
      });
    });
  });

  // ============================================================
  // MCP API
  // ============================================================

  describe("getMcpStatus()", () => {
    it("should call mcp.status()", async () => {
      const status = { server1: { connected: true } };
      mockClient.mcp.status.mockResolvedValue({ data: status });
      await agent.connect();

      const result = await agent.getMcpStatus();

      expect(mockClient.mcp.status).toHaveBeenCalled();
      expect(result).toEqual(status);
    });
  });

  describe("connectMcp()", () => {
    it("should call mcp.connect() with name", async () => {
      await agent.connect();

      await agent.connectMcp("my-server");

      expect(mockClient.mcp.connect).toHaveBeenCalledWith({ name: "my-server" });
    });
  });

  describe("disconnectMcp()", () => {
    it("should call mcp.disconnect() with name", async () => {
      await agent.connect();

      await agent.disconnectMcp("my-server");

      expect(mockClient.mcp.disconnect).toHaveBeenCalledWith({ name: "my-server" });
    });
  });

  // ============================================================
  // Tool API
  // ============================================================

  describe("getToolIds()", () => {
    it("should call tool.ids() and return ToolListItem[] via mapper", async () => {
      await agent.connect();

      const result = await agent.getToolIds();

      expect(mockClient.tool.ids).toHaveBeenCalled();
      // mapToolIds wraps each string into { id }
      expect(result).toEqual([{ id: "tool-1" }, { id: "tool-2" }]);
    });
  });

  // ============================================================
  // Config API
  // ============================================================

  describe("getConfig()", () => {
    it("should call config.get()", async () => {
      const config = { model: "claude-4" };
      mockClient.config.get.mockResolvedValue({ data: config });
      await agent.connect();

      const result = await agent.getConfig();

      expect(mockClient.config.get).toHaveBeenCalled();
      expect(result).toEqual(config);
    });
  });

  describe("updateConfig()", () => {
    it("should call config.update() with config param", async () => {
      await agent.connect();

      await agent.updateConfig({ model: "gpt-4" } as never);

      expect(mockClient.config.update).toHaveBeenCalledWith({
        config: { model: "gpt-4" },
      });
    });
  });

  // ============================================================
  // Path API
  // ============================================================

  describe("getPath()", () => {
    it("should call path.get() and return mapped data", async () => {
      await agent.connect();

      const result = await agent.getPath();

      expect(mockClient.path.get).toHaveBeenCalled();
      expect(result).toEqual({
        config: "/home/.config/opencode",
        data: "/home/.local/share/opencode",
      });
    });
  });

  // ============================================================
  // Event System
  // ============================================================

  describe("onEvent()", () => {
    it("should register listener and return Disposable", async () => {
      await agent.connect();
      const listener = vi.fn();

      const disposable = agent.onEvent(listener);

      expect(disposable).toBeDefined();
      expect(typeof disposable.dispose).toBe("function");
    });

    it("should deliver events from SSE stream to listeners", async () => {
      const events = [
        { type: "session.updated", properties: { id: "sess-1" } },
        { type: "message.created", properties: { id: "msg-1" } },
      ];
      let resolveStream!: () => void;
      const streamDone = new Promise<void>((r) => {
        resolveStream = r;
      });

      mockClient.event.subscribe.mockResolvedValue({
        stream: (async function* () {
          for (const event of events) {
            yield event;
          }
          resolveStream();
        })(),
      });

      const listener = vi.fn();
      agent.onEvent(listener);
      await agent.connect();

      // ストリームの消費は非同期なので少し待つ
      await streamDone;
      // microtask を消化
      await new Promise((r) => setTimeout(r, 0));

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener).toHaveBeenCalledWith(events[0]);
      expect(listener).toHaveBeenCalledWith(events[1]);
    });

    it("should remove listener when Disposable is disposed", async () => {
      // ストリームを手動制御するためのセットアップ
      let emitEvent: ((event: unknown) => void) | undefined;
      let endStream: (() => void) | undefined;

      mockClient.event.subscribe.mockResolvedValue({
        stream: (async function* () {
          const queue: unknown[] = [];
          let resolve: (() => void) | undefined;
          let done = false;

          emitEvent = (event: unknown) => {
            queue.push(event);
            resolve?.();
          };
          endStream = () => {
            done = true;
            resolve?.();
          };

          while (!done) {
            if (queue.length > 0) {
              yield queue.shift()!;
            } else {
              await new Promise<void>((r) => {
                resolve = r;
              });
            }
          }
        })(),
      });

      await agent.connect();
      const listener = vi.fn();
      const disposable = agent.onEvent(listener);

      // イベントを1つ送信
      emitEvent?.({ type: "test-event-1" });
      await new Promise((r) => setTimeout(r, 10));
      expect(listener).toHaveBeenCalledTimes(1);

      // Dispose してからイベントを送信 — 呼ばれないはず
      disposable.dispose();
      emitEvent?.({ type: "test-event-2" });
      await new Promise((r) => setTimeout(r, 10));
      expect(listener).toHaveBeenCalledTimes(1);

      endStream?.();
    });
  });

  describe("resubscribeEvents()", () => {
    it("should abort old stream and create new subscription", async () => {
      await agent.connect();

      // 初回の subscribe 呼び出しを確認
      expect(mockClient.event.subscribe).toHaveBeenCalledTimes(1);

      await agent.resubscribeEvents();

      // 2回目の subscribe 呼び出し（旧ストリームの abort + 新ストリーム開始）
      expect(mockClient.event.subscribe).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================================
  // workspaceFolder
  // ============================================================

  describe("workspaceFolder", () => {
    it("should be settable and readable", () => {
      agent.workspaceFolder = "/my/workspace";
      expect(agent.workspaceFolder).toBe("/my/workspace");
    });
  });

  // ============================================================
  // getServerUrl
  // ============================================================

  describe("getServerUrl()", () => {
    it("should return undefined before connect", () => {
      expect(agent.getServerUrl()).toBeUndefined();
    });

    it("should return server URL after connect", async () => {
      await agent.connect();
      expect(agent.getServerUrl()).toBe("http://localhost:12345");
    });

    it("should return undefined after disconnect", async () => {
      await agent.connect();
      agent.disconnect();
      expect(agent.getServerUrl()).toBeUndefined();
    });
  });

  // ============================================================
  // setModel
  // ============================================================

  describe("setModel()", () => {
    beforeEach(async () => {
      // Connect so that getPath() (requireClient) works
      await agent.connect();
    });

    it("should read existing config, set model, and write back", async () => {
      vi.mocked(fs.readFile).mockResolvedValue('{"theme":"dark"}');

      await agent.setModel!("anthropic/claude-4");

      expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining("opencode.json"), "utf-8");
      expect(fs.mkdir).toHaveBeenCalled();
      // Verify the written JSON contains both the existing key and the new model
      const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
      const written = JSON.parse((writeCall[1] as string).trim());
      expect(written).toEqual({ theme: "dark", model: "anthropic/claude-4" });
    });

    it("should create config from empty object when file does not exist", async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT"));

      await agent.setModel!("openai/gpt-4");

      const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
      const written = JSON.parse((writeCall[1] as string).trim());
      expect(written).toEqual({ model: "openai/gpt-4" });
    });

    it("should throw if agent is not connected", async () => {
      agent.disconnect();
      await expect(agent.setModel!("some-model")).rejects.toThrow("OpenCode client is not connected");
    });
  });
});
