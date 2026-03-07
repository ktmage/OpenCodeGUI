/**
 * extension.ts (activate / deactivate) のユニットテスト。
 * ChatViewProvider と OpenCodeAgent をモックし、起動・停止の振る舞いを検証する。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// --- モックの準備 ---

const mockConnect = vi.fn().mockResolvedValue(undefined);
const mockDisconnect = vi.fn();

// モジュールスコープで `new OpenCodeAgent()` が呼ばれるため、
// コンストラクタとして機能するクラスを返す必要がある。
function createMockAgentClass() {
  return class MockOpenCodeAgent {
    connect = mockConnect;
    disconnect = mockDisconnect;
    workspaceFolder: string | undefined = undefined;
  };
}

// ChatViewProvider のモック — コンストラクタとして使われる
function createMockChatViewProviderClass() {
  return Object.assign(class MockChatViewProvider {}, { viewType: "opencode.chatView" });
}

import * as vscode from "vscode";

describe("extension", () => {
  let originalCwd: string;
  let chdirSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    originalCwd = process.cwd();
    // process.chdir を no-op にする（/workspace/project は実在しないため）
    chdirSpy = vi.spyOn(process, "chdir").mockImplementation(() => {});
    // workspaceFolders をデフォルトで設定
    vi.mocked(vscode.workspace).workspaceFolders = [{ uri: { fsPath: "/workspace/project", scheme: "file" } }] as never;
  });

  afterEach(() => {
    chdirSpy.mockRestore();
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  /**
   * extension.ts はモジュールスコープで `new OpenCodeAgent()` を実行する。
   * テストごとに新しいモジュールインスタンスが必要なので、毎回 resetModules して再 import する。
   */
  async function importExtension() {
    vi.resetModules();

    vi.doMock("@opencodegui/agent-opencode", () => ({
      OpenCodeAgent: createMockAgentClass(),
    }));
    vi.doMock("../chat-view-provider", () => ({
      ChatViewProvider: createMockChatViewProviderClass(),
    }));

    return import("../extension");
  }

  // ============================================================
  // activate - 正常系
  // ============================================================

  describe("activate() - normal", () => {
    it("should connect, register webview provider and diff providers", async () => {
      const ext = await importExtension();
      const subscriptions: { dispose: () => void }[] = [];
      const context = {
        extensionUri: { fsPath: "/ext" },
        subscriptions,
      };

      await ext.activate(context as never);

      // connect が呼ばれた
      expect(mockConnect).toHaveBeenCalled();

      // webview provider 登録
      expect(vscode.window.registerWebviewViewProvider).toHaveBeenCalledWith("opencode.chatView", expect.anything());

      // diff content provider 登録（2つ: before と after）
      expect(vscode.workspace.registerTextDocumentContentProvider).toHaveBeenCalledTimes(2);
      expect(vscode.workspace.registerTextDocumentContentProvider).toHaveBeenCalledWith(
        "opencode-diff-before",
        expect.anything(),
      );
      expect(vscode.workspace.registerTextDocumentContentProvider).toHaveBeenCalledWith(
        "opencode-diff-after",
        expect.anything(),
      );

      // subscriptions に push された (webview provider + 2 diff providers + Disposable for disconnect)
      expect(subscriptions.length).toBeGreaterThanOrEqual(3);
    });

    it("should change cwd to workspace folder and restore it", async () => {
      const ext = await importExtension();
      const context = { extensionUri: { fsPath: "/ext" }, subscriptions: [] };

      await ext.activate(context as never);

      // chdir が workspaceFolder で呼ばれ、その後元に戻されること
      const chdirCalls = chdirSpy.mock.calls.map((c: string[]) => c[0]);
      expect(chdirCalls[0]).toBe("/workspace/project");
      // finally ブロックで元の cwd に戻される
      expect(chdirCalls.length).toBe(2);
    });
  });

  // ============================================================
  // activate - ワークスペースなし
  // ============================================================

  describe("activate() - no workspace", () => {
    it("should show warning and return early", async () => {
      vi.mocked(vscode.workspace).workspaceFolders = undefined as never;
      const ext = await importExtension();
      const context = { extensionUri: { fsPath: "/ext" }, subscriptions: [] };

      await ext.activate(context as never);

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(expect.stringContaining("workspace"));
      expect(mockConnect).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // activate - ENOENT エラー（opencode コマンドが見つからない）
  // ============================================================

  describe("activate() - ENOENT error", () => {
    it("should show warning for ENOENT code", async () => {
      const error = new Error("spawn opencode ENOENT") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      mockConnect.mockRejectedValueOnce(error);

      const ext = await importExtension();
      const context = { extensionUri: { fsPath: "/ext" }, subscriptions: [] };

      await ext.activate(context as never);

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(expect.stringContaining("opencode"));
      // webview provider が登録されない
      expect(vscode.window.registerWebviewViewProvider).not.toHaveBeenCalled();
    });

    it("should show warning for ENOENT in message", async () => {
      const error = new Error("ENOENT: command not found");
      mockConnect.mockRejectedValueOnce(error);

      const ext = await importExtension();
      const context = { extensionUri: { fsPath: "/ext" }, subscriptions: [] };

      await ext.activate(context as never);

      expect(vscode.window.showWarningMessage).toHaveBeenCalledWith(expect.stringContaining("opencode"));
    });
  });

  // ============================================================
  // activate - 非 ENOENT エラー
  // ============================================================

  describe("activate() - non-ENOENT error", () => {
    it("should rethrow non-ENOENT errors", async () => {
      const error = new Error("Connection refused");
      mockConnect.mockRejectedValueOnce(error);

      const ext = await importExtension();
      const context = { extensionUri: { fsPath: "/ext" }, subscriptions: [] };

      await expect(ext.activate(context as never)).rejects.toThrow("Connection refused");
    });
  });

  // ============================================================
  // deactivate
  // ============================================================

  describe("deactivate()", () => {
    it("should call agent.disconnect()", async () => {
      const ext = await importExtension();

      ext.deactivate();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  // ============================================================
  // diff content provider
  // ============================================================

  describe("diff content provider", () => {
    it("should decode URI query to provide document content", async () => {
      const ext = await importExtension();
      const context = { extensionUri: { fsPath: "/ext" }, subscriptions: [] };
      await ext.activate(context as never);

      // registerTextDocumentContentProvider に渡されたプロバイダーを取得
      const registerCalls = vi.mocked(vscode.workspace.registerTextDocumentContentProvider).mock.calls;
      const beforeProvider = registerCalls.find((c) => c[0] === "opencode-diff-before")?.[1];

      expect(beforeProvider).toBeDefined();

      // URI query にエンコードされたコンテンツを渡す
      const content = "const a = 1;\nconst b = 2;";
      const uri = {
        scheme: "opencode-diff-before",
        path: "src/index.ts",
        query: encodeURIComponent(content),
      };

      const result = beforeProvider!.provideTextDocumentContent(uri as never, undefined as never);
      expect(result).toBe(content);
    });
  });
});
