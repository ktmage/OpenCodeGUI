/**
 * ChatViewProvider のユニットテスト。
 * IAgent をモックし、webview メッセージハンドラの振る舞いを検証する。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// node:fs/promises と node:path のモック
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

import * as fs from "node:fs/promises";
import type { IAgent, IPlatformServices } from "@opencodegui/core";
import * as vscode from "vscode";
import { ChatViewProvider } from "../chat-view-provider";

// --- Helper: IAgent のモック ---

function createMockAgent(): {
  [K in keyof IAgent]: IAgent[K] extends (...args: never[]) => unknown ? ReturnType<typeof vi.fn> : IAgent[K];
} {
  return {
    getCapabilities: vi.fn().mockReturnValue({
      sessionDelete: true,
      sessionFork: true,
      sessionRevert: true,
      sessionShare: true,
      sessionSummarize: true,
      sessionDiff: true,
      todo: true,
      multiProvider: true,
      permission: true,
      mcp: true,
      subAgent: true,
      shell: true,
      config: true,
    }),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn(),
    onEvent: vi.fn().mockReturnValue({ dispose: vi.fn() }),
    listSessions: vi.fn().mockResolvedValue([]),
    createSession: vi.fn().mockResolvedValue({ id: "new-sess", title: "New" }),
    getSession: vi.fn().mockResolvedValue({ id: "sess-1" }),
    deleteSession: vi.fn().mockResolvedValue(undefined),
    forkSession: vi.fn().mockResolvedValue({ id: "fork-1" }),
    revertSession: vi.fn().mockResolvedValue({ id: "sess-1" }),
    unrevertSession: vi.fn().mockResolvedValue({ id: "sess-1" }),
    summarizeSession: vi.fn().mockResolvedValue(undefined),
    shareSession: vi.fn().mockResolvedValue({ id: "sess-1" }),
    unshareSession: vi.fn().mockResolvedValue({ id: "sess-1" }),
    getMessages: vi.fn().mockResolvedValue([]),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    abortSession: vi.fn().mockResolvedValue(undefined),
    executeShell: vi.fn().mockResolvedValue(undefined),
    getProviders: vi.fn().mockResolvedValue({ providers: [], default: {} }),
    listAllProviders: vi.fn().mockResolvedValue({ all: [], default: {}, connected: [] }),
    getAgents: vi.fn().mockResolvedValue([]),
    getChildSessions: vi.fn().mockResolvedValue([]),
    replyPermission: vi.fn().mockResolvedValue(undefined),
    getSessionDiff: vi.fn().mockResolvedValue([]),
    getSessionTodos: vi.fn().mockResolvedValue([]),
    getConfig: vi.fn().mockResolvedValue({}),
    updateConfig: vi.fn().mockResolvedValue(undefined),
    getPath: vi.fn().mockResolvedValue({ config: "/home/.config/opencode", data: "/home/.data" }),
    getMcpStatus: vi.fn().mockResolvedValue({}),
    connectMcp: vi.fn().mockResolvedValue(undefined),
    disconnectMcp: vi.fn().mockResolvedValue(undefined),
    getToolIds: vi.fn().mockResolvedValue([]),
    getServerUrl: vi.fn().mockReturnValue("http://localhost:12345"),
    setModel: vi.fn().mockResolvedValue(undefined),
  } as never;
}

// --- Helper: IPlatformServices のモック ---

function createMockPlatformServices(): {
  [K in keyof IPlatformServices]: ReturnType<typeof vi.fn>;
} {
  return {
    openDiffEditor: vi.fn().mockResolvedValue(undefined),
    copyToClipboard: vi.fn().mockResolvedValue(undefined),
    openTerminal: vi.fn().mockResolvedValue(undefined),
    openConfigFile: vi.fn().mockResolvedValue(undefined),
    openFile: vi.fn().mockResolvedValue(undefined),
    searchWorkspaceFiles: vi.fn().mockResolvedValue([]),
    getOpenEditors: vi.fn().mockResolvedValue([]),
  };
}

// --- Helper: WebviewView のモック ---

function createMockWebviewView() {
  const postMessage = vi.fn();
  let messageHandler: ((message: unknown) => void) | undefined;

  const webview = {
    postMessage,
    onDidReceiveMessage: vi.fn((handler: (message: unknown) => void) => {
      messageHandler = handler;
      return { dispose: vi.fn() };
    }),
    options: {} as Record<string, unknown>,
    html: "",
    asWebviewUri: vi.fn((uri: { fsPath: string }) => uri.fsPath),
    cspSource: "https://test.csp",
  };

  const webviewView = {
    webview,
    // 以下は WebviewViewResolveContext 相当
    viewType: "opencode.chatView",
    title: undefined,
    description: undefined,
    badge: undefined,
    visible: true,
    onDidDispose: vi.fn(),
    onDidChangeVisibility: vi.fn(),
    show: vi.fn(),
  };

  /** テスト内から webview メッセージを送信する */
  function sendMessage(message: unknown): Promise<void> {
    if (!messageHandler) throw new Error("resolveWebviewView has not been called");
    messageHandler(message);
    // ハンドラは async なので microtask を消化
    return new Promise((r) => setTimeout(r, 0));
  }

  return { webviewView, webview, postMessage, sendMessage };
}

// --- Helper: Provider を resolveWebviewView して返す ---

function setupProvider(
  mockAgent: ReturnType<typeof createMockAgent>,
  mockPlatformServices?: ReturnType<typeof createMockPlatformServices>,
) {
  const extensionUri = { fsPath: "/ext" };
  const ps = mockPlatformServices ?? createMockPlatformServices();
  const provider = new ChatViewProvider(extensionUri as never, mockAgent as never, ps as never);
  const mock = createMockWebviewView();
  provider.resolveWebviewView(
    mock.webviewView as never,
    {} as never,
    { isCancellationRequested: false, onCancellationRequested: vi.fn() } as never,
  );
  return { provider, platformServices: ps, ...mock };
}

describe("ChatViewProvider", () => {
  let mockAgent: ReturnType<typeof createMockAgent>;

  beforeEach(() => {
    mockAgent = createMockAgent();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================================
  // resolveWebviewView の基本動作
  // ============================================================

  describe("resolveWebviewView()", () => {
    it("should set webview options and html", () => {
      const { webview } = setupProvider(mockAgent);

      expect(webview.options.enableScripts).toBe(true);
      expect(webview.html).toContain("<!DOCTYPE html>");
    });

    it("should register message handler", () => {
      const { webview } = setupProvider(mockAgent);

      expect(webview.onDidReceiveMessage).toHaveBeenCalled();
    });

    it("should register SSE event forwarding", () => {
      setupProvider(mockAgent);

      expect(mockAgent.onEvent).toHaveBeenCalled();
    });

    it("should register active editor change listener", () => {
      setupProvider(mockAgent);

      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
    });
  });

  // ============================================================
  // SSE イベント転送
  // ============================================================

  describe("SSE event forwarding", () => {
    it("should forward events to webview via postMessage", () => {
      const { postMessage } = setupProvider(mockAgent);

      // onEvent に渡されたコールバックを取得して呼び出す
      const eventCallback = (mockAgent.onEvent as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const event = { type: "session.updated", properties: { id: "sess-1" } };
      eventCallback(event);

      expect(postMessage).toHaveBeenCalledWith({ type: "event", event });
    });
  });

  // ============================================================
  // activeEditor リスナー
  // ============================================================

  describe("activeEditor listener", () => {
    it("should send activeEditor message when editor changes", () => {
      const { postMessage } = setupProvider(mockAgent);

      const editorCallback = vi.mocked(vscode.window.onDidChangeActiveTextEditor).mock.calls[0][0] as (
        editor: unknown,
      ) => void;

      // file スキームのエディタ
      editorCallback({
        document: {
          uri: { scheme: "file", fsPath: "/workspace/src/index.ts" },
        },
      });

      expect(postMessage).toHaveBeenCalledWith({
        type: "activeEditor",
        file: { filePath: "src/index.ts", fileName: "index.ts" },
      });
    });

    it("should send null for non-file scheme editor", () => {
      const { postMessage } = setupProvider(mockAgent);

      const editorCallback = vi.mocked(vscode.window.onDidChangeActiveTextEditor).mock.calls[0][0] as (
        editor: unknown,
      ) => void;

      editorCallback({
        document: { uri: { scheme: "output", fsPath: "/output" } },
      });

      expect(postMessage).toHaveBeenCalledWith({
        type: "activeEditor",
        file: null,
      });
    });

    it("should send null when no editor", () => {
      const { postMessage } = setupProvider(mockAgent);

      const editorCallback = vi.mocked(vscode.window.onDidChangeActiveTextEditor).mock.calls[0][0] as (
        editor: unknown,
      ) => void;
      editorCallback(undefined);

      expect(postMessage).toHaveBeenCalledWith({
        type: "activeEditor",
        file: null,
      });
    });
  });

  // ============================================================
  // ready ハンドラ
  // ============================================================

  describe("ready", () => {
    it("should send init, sessions, activeSession, providers, and activeEditor", async () => {
      const sessions = [{ id: "s1" }, { id: "s2" }];
      mockAgent.listSessions.mockResolvedValue(sessions);
      mockAgent.getProviders.mockResolvedValue({
        providers: [{ id: "p1" }],
        default: { model: "claude-4" },
      });
      mockAgent.listAllProviders.mockResolvedValue({
        all: [{ id: "p1" }],
        default: {},
        connected: ["p1"],
      });
      mockAgent.getPath.mockResolvedValue({
        config: "/home/.config/opencode",
        data: "/home/.data",
      });
      vi.mocked(fs.readFile).mockResolvedValue('{"model":"anthropic/claude-4"}');

      const { postMessage, sendMessage } = setupProvider(mockAgent);

      await sendMessage({ type: "ready" });

      // init (locale + toolConfig を統合)
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "init",
          locale: "en",
          paths: { config: "/home/.config/opencode", data: "/home/.data" },
          capabilities: expect.objectContaining({
            sessionDelete: true,
            sessionFork: true,
            sessionRevert: true,
            sessionShare: true,
            sessionSummarize: true,
            sessionDiff: true,
            todo: true,
            multiProvider: true,
            permission: true,
            mcp: true,
            subAgent: true,
            shell: true,
            config: true,
          }),
        }),
      );

      // sessions
      expect(postMessage).toHaveBeenCalledWith({
        type: "sessions",
        sessions,
      });

      // activeSession (初期状態は null)
      expect(postMessage).toHaveBeenCalledWith({
        type: "activeSession",
        session: null,
      });

      // providers
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "providers",
          providers: [{ id: "p1" }],
          default: { model: "claude-4" },
          configModel: "anthropic/claude-4",
        }),
      );

      // activeEditor
      expect(postMessage).toHaveBeenCalledWith({
        type: "activeEditor",
        file: null,
      });
    });

    it("should set configModel to undefined when config file read fails", async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT"));

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "ready" });

      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "providers",
          configModel: undefined,
        }),
      );
    });
  });

  // ============================================================
  // createSession
  // ============================================================

  describe("createSession", () => {
    it("should create session, update activeSession, and send sessions", async () => {
      const newSession = { id: "new-1", title: "New Session" };
      mockAgent.createSession.mockResolvedValue(newSession);
      const allSessions = [newSession];
      mockAgent.listSessions.mockResolvedValue(allSessions);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "createSession", title: "New Session" });

      expect(mockAgent.createSession).toHaveBeenCalledWith("New Session");
      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session: newSession });
      expect(postMessage).toHaveBeenCalledWith({ type: "sessions", sessions: allSessions });
    });
  });

  // ============================================================
  // listSessions
  // ============================================================

  describe("listSessions", () => {
    it("should send sessions list", async () => {
      const sessions = [{ id: "s1" }];
      mockAgent.listSessions.mockResolvedValue(sessions);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "listSessions" });

      expect(postMessage).toHaveBeenCalledWith({ type: "sessions", sessions });
    });
  });

  // ============================================================
  // selectSession
  // ============================================================

  describe("selectSession", () => {
    it("should get session and messages, then send both", async () => {
      const session = { id: "sess-1" };
      const messages = [{ info: { id: "m1" }, parts: [] }];
      mockAgent.getSession.mockResolvedValue(session);
      mockAgent.getMessages.mockResolvedValue(messages);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "selectSession", sessionId: "sess-1" });

      expect(mockAgent.getSession).toHaveBeenCalledWith("sess-1");
      expect(mockAgent.getMessages).toHaveBeenCalledWith("sess-1");
      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session });
      expect(postMessage).toHaveBeenCalledWith({
        type: "messages",
        sessionId: "sess-1",
        messages,
      });
    });
  });

  // ============================================================
  // deleteSession
  // ============================================================

  describe("deleteSession", () => {
    it("should clear activeSession when deleting active session", async () => {
      // まずセッションをアクティブにする
      const session = { id: "sess-1" };
      mockAgent.createSession.mockResolvedValue(session);
      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "createSession" });

      // アクティブセッションを削除
      mockAgent.listSessions.mockResolvedValue([]);
      await sendMessage({ type: "deleteSession", sessionId: "sess-1" });

      expect(mockAgent.deleteSession).toHaveBeenCalledWith("sess-1");
      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session: null });
      expect(postMessage).toHaveBeenCalledWith({ type: "sessions", sessions: [] });
    });

    it("should not change activeSession when deleting different session", async () => {
      // まずセッション sess-1 をアクティブにする
      const session = { id: "sess-1" };
      mockAgent.createSession.mockResolvedValue(session);
      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "createSession" });
      postMessage.mockClear();

      // 別のセッションを削除
      await sendMessage({ type: "deleteSession", sessionId: "sess-2" });

      // activeSession が null にならないこと（activeSession メッセージが送られない）
      const activeSessionCalls = postMessage.mock.calls.filter(
        (c) => (c[0] as { type: string }).type === "activeSession",
      );
      expect(activeSessionCalls).toHaveLength(0);
    });
  });

  // ============================================================
  // sendMessage
  // ============================================================

  describe("sendMessage", () => {
    it("should call agent.sendMessage with correct args (IAgent signature)", async () => {
      const { sendMessage } = setupProvider(mockAgent);

      await sendMessage({
        type: "sendMessage",
        sessionId: "sess-1",
        text: "Hello",
        model: { providerID: "anthropic", modelID: "claude-4" },
        files: [{ filePath: "a.ts", fileName: "a.ts" }],
        agent: "reviewer",
      });

      expect(mockAgent.sendMessage).toHaveBeenCalledWith("sess-1", "Hello", {
        model: { providerID: "anthropic", modelID: "claude-4" },
        files: [{ filePath: "a.ts", fileName: "a.ts" }],
        agent: "reviewer",
      });
    });
  });

  // ============================================================
  // getMessages
  // ============================================================

  describe("getMessages", () => {
    it("should send messages for session", async () => {
      const messages = [{ info: { id: "m1" }, parts: [] }];
      mockAgent.getMessages.mockResolvedValue(messages);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "getMessages", sessionId: "sess-1" });

      expect(postMessage).toHaveBeenCalledWith({
        type: "messages",
        sessionId: "sess-1",
        messages,
      });
    });
  });

  // ============================================================
  // replyPermission
  // ============================================================

  describe("replyPermission", () => {
    it("should call agent.replyPermission with 3 args", async () => {
      const { sendMessage } = setupProvider(mockAgent);

      await sendMessage({
        type: "replyPermission",
        sessionId: "sess-1",
        permissionId: "perm-1",
        response: "always",
      });

      expect(mockAgent.replyPermission).toHaveBeenCalledWith("sess-1", "perm-1", "always");
    });
  });

  // ============================================================
  // abort
  // ============================================================

  describe("abort", () => {
    it("should call agent.abortSession", async () => {
      const { sendMessage } = setupProvider(mockAgent);

      await sendMessage({ type: "abort", sessionId: "sess-1" });

      expect(mockAgent.abortSession).toHaveBeenCalledWith("sess-1");
    });
  });

  // ============================================================
  // getProviders
  // ============================================================

  describe("getProviders", () => {
    it("should send providers with configModel from file", async () => {
      mockAgent.getProviders.mockResolvedValue({
        providers: [{ id: "p1" }],
        default: { model: "m1" },
      });
      mockAgent.listAllProviders.mockResolvedValue({
        all: [{ id: "p1" }],
        default: {},
        connected: [],
      });
      mockAgent.getPath.mockResolvedValue({ config: "/cfg", data: "/data" });
      vi.mocked(fs.readFile).mockResolvedValue('{"model":"openai/gpt-4"}');

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "getProviders" });

      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "providers",
          providers: [{ id: "p1" }],
          configModel: "openai/gpt-4",
        }),
      );
    });

    it("should set configModel to undefined when file read fails", async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error("ENOENT"));

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "getProviders" });

      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "providers",
          configModel: undefined,
        }),
      );
    });
  });

  // ============================================================
  // getOpenEditors
  // ============================================================

  describe("getOpenEditors", () => {
    it("should delegate to platformServices.getOpenEditors and send result", async () => {
      const mockPS = createMockPlatformServices();
      mockPS.getOpenEditors.mockResolvedValue([
        { filePath: "src/index.ts", fileName: "index.ts" },
        { filePath: "src/app.ts", fileName: "app.ts" },
      ]);

      const { postMessage, sendMessage } = setupProvider(mockAgent, mockPS);
      await sendMessage({ type: "getOpenEditors" });

      expect(mockPS.getOpenEditors).toHaveBeenCalled();
      expect(postMessage).toHaveBeenCalledWith({
        type: "openEditors",
        files: [
          { filePath: "src/index.ts", fileName: "index.ts" },
          { filePath: "src/app.ts", fileName: "app.ts" },
        ],
      });
    });
  });

  // ============================================================
  // searchWorkspaceFiles
  // ============================================================

  describe("searchWorkspaceFiles", () => {
    it("should delegate to platformServices.searchWorkspaceFiles and send result", async () => {
      const mockPS = createMockPlatformServices();
      mockPS.searchWorkspaceFiles.mockResolvedValue([{ filePath: "src/index.ts", fileName: "index.ts" }]);

      const { postMessage, sendMessage } = setupProvider(mockAgent, mockPS);
      await sendMessage({ type: "searchWorkspaceFiles", query: "index" });

      expect(mockPS.searchWorkspaceFiles).toHaveBeenCalledWith("index");
      expect(postMessage).toHaveBeenCalledWith({
        type: "workspaceFiles",
        files: [{ filePath: "src/index.ts", fileName: "index.ts" }],
      });
    });
  });

  // ============================================================
  // compressSession
  // ============================================================

  describe("compressSession", () => {
    it("should call summarizeSession", async () => {
      const { sendMessage } = setupProvider(mockAgent);
      const model = { providerID: "openai", modelID: "gpt-4" };

      await sendMessage({ type: "compressSession", sessionId: "sess-1", model });

      expect(mockAgent.summarizeSession).toHaveBeenCalledWith("sess-1", model);
    });
  });

  // ============================================================
  // revertToMessage
  // ============================================================

  describe("revertToMessage", () => {
    it("should revert session and send activeSession + messages", async () => {
      const session = { id: "sess-1" };
      const messages = [{ info: { id: "m1" }, parts: [] }];
      mockAgent.revertSession.mockResolvedValue(session);
      mockAgent.getMessages.mockResolvedValue(messages);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "revertToMessage", sessionId: "sess-1", messageId: "msg-3" });

      expect(mockAgent.revertSession).toHaveBeenCalledWith("sess-1", "msg-3");
      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session });
      expect(postMessage).toHaveBeenCalledWith({
        type: "messages",
        sessionId: "sess-1",
        messages,
      });
    });
  });

  // ============================================================
  // editAndResend
  // ============================================================

  describe("editAndResend", () => {
    it("should revert, send messages, then sendMessage with new text", async () => {
      const session = { id: "sess-1" };
      mockAgent.revertSession.mockResolvedValue(session);
      mockAgent.getMessages.mockResolvedValue([]);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({
        type: "editAndResend",
        sessionId: "sess-1",
        messageId: "msg-3",
        text: "Updated text",
        model: { providerID: "openai", modelID: "gpt-4" },
        files: [{ filePath: "a.ts", fileName: "a.ts" }],
      });

      // 1. revert
      expect(mockAgent.revertSession).toHaveBeenCalledWith("sess-1", "msg-3");
      // 2. intermediate state sent
      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session });
      expect(postMessage).toHaveBeenCalledWith({
        type: "messages",
        sessionId: "sess-1",
        messages: [],
      });
      // 3. send new message (IAgent signature with options)
      expect(mockAgent.sendMessage).toHaveBeenCalledWith("sess-1", "Updated text", {
        model: { providerID: "openai", modelID: "gpt-4" },
        files: [{ filePath: "a.ts", fileName: "a.ts" }],
      });
    });
  });

  // ============================================================
  // executeShell
  // ============================================================

  describe("executeShell", () => {
    it("should call agent.executeShell", async () => {
      const { sendMessage } = setupProvider(mockAgent);
      const model = { providerID: "openai", modelID: "gpt-4" };

      await sendMessage({ type: "executeShell", sessionId: "sess-1", command: "ls", model });

      expect(mockAgent.executeShell).toHaveBeenCalledWith("sess-1", "ls", model);
    });
  });

  // ============================================================
  // openConfigFile
  // ============================================================

  describe("openConfigFile", () => {
    it("should delegate to platformServices.openConfigFile", async () => {
      const mockPS = createMockPlatformServices();
      const { sendMessage } = setupProvider(mockAgent, mockPS);
      await sendMessage({ type: "openConfigFile", filePath: "/home/.config/opencode/opencode.json" });

      expect(mockPS.openConfigFile).toHaveBeenCalledWith("/home/.config/opencode/opencode.json");
    });
  });

  // ============================================================
  // openTerminal
  // ============================================================

  describe("openTerminal", () => {
    it("should do nothing when serverUrl is undefined", async () => {
      mockAgent.getServerUrl.mockReturnValue(undefined);
      const mockPS = createMockPlatformServices();

      const { sendMessage } = setupProvider(mockAgent, mockPS);
      await sendMessage({ type: "openTerminal" });

      expect(mockPS.openTerminal).not.toHaveBeenCalled();
    });

    it("should delegate to platformServices.openTerminal with serverUrl", async () => {
      const mockPS = createMockPlatformServices();

      const { sendMessage } = setupProvider(mockAgent, mockPS);
      await sendMessage({ type: "openTerminal" });

      expect(mockPS.openTerminal).toHaveBeenCalledWith("http://localhost:12345", undefined);
    });

    it("should include sessionId when activeSession exists", async () => {
      const mockPS = createMockPlatformServices();
      mockAgent.createSession.mockResolvedValue({ id: "sess-1" });

      const { sendMessage } = setupProvider(mockAgent, mockPS);
      // まずアクティブセッションを設定
      await sendMessage({ type: "createSession" });

      await sendMessage({ type: "openTerminal" });

      expect(mockPS.openTerminal).toHaveBeenCalledWith("http://localhost:12345", "sess-1");
    });
  });

  // ============================================================
  // setModel
  // ============================================================

  describe("setModel", () => {
    it("should delegate to agent.setModel and send modelUpdated", async () => {
      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "setModel", model: "anthropic/claude-4" });

      expect(mockAgent.setModel).toHaveBeenCalledWith("anthropic/claude-4");
      expect(postMessage).toHaveBeenCalledWith({
        type: "modelUpdated",
        model: "anthropic/claude-4",
        default: {},
      });
    });
  });

  // ============================================================
  // forkSession
  // ============================================================

  describe("forkSession", () => {
    it("should fork session, update activeSession, and send sessions", async () => {
      const forked = { id: "fork-1" };
      mockAgent.forkSession.mockResolvedValue(forked);
      mockAgent.listSessions.mockResolvedValue([forked]);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "forkSession", sessionId: "sess-1", messageId: "msg-3" });

      expect(mockAgent.forkSession).toHaveBeenCalledWith("sess-1", "msg-3");
      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session: forked });
      expect(postMessage).toHaveBeenCalledWith({ type: "sessions", sessions: [forked] });
    });
  });

  // ============================================================
  // getSessionDiff
  // ============================================================

  describe("getSessionDiff", () => {
    it("should send sessionDiff message", async () => {
      const diffs = [{ path: "a.ts", before: "x", after: "y" }];
      mockAgent.getSessionDiff.mockResolvedValue(diffs);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "getSessionDiff", sessionId: "sess-1" });

      expect(postMessage).toHaveBeenCalledWith({
        type: "sessionDiff",
        sessionId: "sess-1",
        diffs,
      });
    });
  });

  // ============================================================
  // getSessionTodos
  // ============================================================

  describe("getSessionTodos", () => {
    it("should send sessionTodos message", async () => {
      const todos = [{ id: "t1", text: "Fix bug" }];
      mockAgent.getSessionTodos.mockResolvedValue(todos);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "getSessionTodos", sessionId: "sess-1" });

      expect(postMessage).toHaveBeenCalledWith({
        type: "sessionTodos",
        sessionId: "sess-1",
        todos,
      });
    });
  });

  // ============================================================
  // getChildSessions
  // ============================================================

  describe("getChildSessions", () => {
    it("should send childSessions message", async () => {
      const children = [{ id: "child-1" }];
      mockAgent.getChildSessions.mockResolvedValue(children);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "getChildSessions", sessionId: "sess-1" });

      expect(postMessage).toHaveBeenCalledWith({
        type: "childSessions",
        sessionId: "sess-1",
        children,
      });
    });
  });

  // ============================================================
  // getAgents
  // ============================================================

  describe("getAgents", () => {
    it("should send agents message", async () => {
      const agents = [{ id: "agent-1" }];
      mockAgent.getAgents.mockResolvedValue(agents);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "getAgents" });

      expect(postMessage).toHaveBeenCalledWith({ type: "agents", agents });
    });
  });

  // ============================================================
  // shareSession
  // ============================================================

  describe("shareSession", () => {
    it("should update activeSession and copy share URL via platformServices", async () => {
      const session = { id: "sess-1", share: { url: "https://share.example.com/abc" } };
      mockAgent.shareSession.mockResolvedValue(session);
      const mockPS = createMockPlatformServices();

      const { postMessage, sendMessage } = setupProvider(mockAgent, mockPS);
      await sendMessage({ type: "shareSession", sessionId: "sess-1" });

      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session });
      expect(mockPS.copyToClipboard).toHaveBeenCalledWith("https://share.example.com/abc");
    });

    it("should not copy to clipboard when share.url is absent", async () => {
      const session = { id: "sess-1" };
      mockAgent.shareSession.mockResolvedValue(session);
      const mockPS = createMockPlatformServices();

      const { sendMessage } = setupProvider(mockAgent, mockPS);
      await sendMessage({ type: "shareSession", sessionId: "sess-1" });

      expect(mockPS.copyToClipboard).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // unshareSession
  // ============================================================

  describe("unshareSession", () => {
    it("should update activeSession", async () => {
      const session = { id: "sess-1" };
      mockAgent.unshareSession.mockResolvedValue(session);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "unshareSession", sessionId: "sess-1" });

      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session });
    });
  });

  // ============================================================
  // undoSession
  // ============================================================

  describe("undoSession", () => {
    it("should revert session and send activeSession + messages", async () => {
      const session = { id: "sess-1" };
      const messages = [{ info: { id: "m1" }, parts: [] }];
      mockAgent.revertSession.mockResolvedValue(session);
      mockAgent.getMessages.mockResolvedValue(messages);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "undoSession", sessionId: "sess-1", messageId: "msg-5" });

      expect(mockAgent.revertSession).toHaveBeenCalledWith("sess-1", "msg-5");
      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session });
      expect(postMessage).toHaveBeenCalledWith({
        type: "messages",
        sessionId: "sess-1",
        messages,
      });
    });
  });

  // ============================================================
  // redoSession
  // ============================================================

  describe("redoSession", () => {
    it("should unrevert session and send activeSession + messages", async () => {
      const session = { id: "sess-1" };
      const messages = [{ info: { id: "m1" }, parts: [] }];
      mockAgent.unrevertSession.mockResolvedValue(session);
      mockAgent.getMessages.mockResolvedValue(messages);

      const { postMessage, sendMessage } = setupProvider(mockAgent);
      await sendMessage({ type: "redoSession", sessionId: "sess-1" });

      expect(mockAgent.unrevertSession).toHaveBeenCalledWith("sess-1");
      expect(postMessage).toHaveBeenCalledWith({ type: "activeSession", session });
      expect(postMessage).toHaveBeenCalledWith({
        type: "messages",
        sessionId: "sess-1",
        messages,
      });
    });
  });

  // ============================================================
  // openDiffEditor
  // ============================================================

  describe("openDiffEditor", () => {
    it("should delegate to platformServices.openDiffEditor", async () => {
      const mockPS = createMockPlatformServices();
      const { sendMessage } = setupProvider(mockAgent, mockPS);

      await sendMessage({
        type: "openDiffEditor",
        filePath: "src/index.ts",
        before: "const a = 1;",
        after: "const a = 2;",
      });

      expect(mockPS.openDiffEditor).toHaveBeenCalledWith("src/index.ts", "const a = 1;", "const a = 2;");
    });
  });

  // ============================================================
  // openFile
  // ============================================================

  describe("openFile", () => {
    it("should delegate to platformServices.openFile", async () => {
      const mockPS = createMockPlatformServices();
      const { sendMessage } = setupProvider(mockAgent, mockPS);

      await sendMessage({
        type: "openFile",
        filePath: "/home/user/project/src/main.ts",
        line: 42,
      });

      expect(mockPS.openFile).toHaveBeenCalledWith("/home/user/project/src/main.ts", 42);
    });

    it("should delegate to platformServices.openFile without line", async () => {
      const mockPS = createMockPlatformServices();
      const { sendMessage } = setupProvider(mockAgent, mockPS);

      await sendMessage({
        type: "openFile",
        filePath: "/home/user/project/src/main.ts",
      });

      expect(mockPS.openFile).toHaveBeenCalledWith("/home/user/project/src/main.ts", undefined);
    });
  });

  // ============================================================
  // copyToClipboard
  // ============================================================

  describe("copyToClipboard", () => {
    it("should delegate to platformServices.copyToClipboard", async () => {
      const mockPS = createMockPlatformServices();
      const { sendMessage } = setupProvider(mockAgent, mockPS);

      await sendMessage({ type: "copyToClipboard", text: "Hello World" });

      expect(mockPS.copyToClipboard).toHaveBeenCalledWith("Hello World");
    });
  });

  // ============================================================
  // エラーハンドリング
  // ============================================================

  describe("error handling", () => {
    it("should catch and log errors without throwing", async () => {
      mockAgent.listSessions.mockRejectedValue(new Error("Network error"));
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { sendMessage } = setupProvider(mockAgent);

      // エラーが swallow されること（throw しない）
      await expect(sendMessage({ type: "listSessions" })).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error handling message 'listSessions'"),
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  // ============================================================
  // postMessage の null safety
  // ============================================================

  describe("postMessage null safety", () => {
    it("should not crash when view is not set", () => {
      // resolveWebviewView を呼ばずに provider を作成
      const extensionUri = { fsPath: "/ext" };
      const provider = new ChatViewProvider(
        extensionUri as never,
        mockAgent as never,
        createMockPlatformServices() as never,
      );

      // view が undefined のまま postMessage を呼ぶ（内部的に）
      // 直接呼べないので、readyメッセージなしでセッション操作を試みる
      // — ただし handleWebviewMessage は resolveWebviewView 後にのみ登録されるため、
      // ここでは provider 内部の postMessage が安全に動作することを間接的に確認する
      expect(() => {
        // postMessage はプライベートだが、view が undefined の場合 optional chaining で安全
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (provider as any).postMessage({ type: "sessions", sessions: [] });
      }).not.toThrow();
    });
  });
});
