import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createAllProvidersData, createMessage, createProvider, createSession, createToolPart } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** アクティブセッションを持つ状態をセットアップする */
async function setupActiveSession() {
  renderApp();
  const session = createSession({ id: "s1", title: "Chat" });
  await sendExtMessage({ type: "activeSession", session });
  vi.mocked(postMessage).mockClear();
  return session;
}

// Shell command execution
describe("シェルコマンド実行", () => {
  // ! prefix sends executeShell instead of sendMessage
  it("! プレフィクスで executeShell が送信されること", async () => {
    const session = await setupActiveSession();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "!ls -la{Enter}");

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "executeShell",
        sessionId: session.id,
        command: "ls -la",
      }),
    );
  });

  // ! prefix does not send sendMessage
  it("! プレフィクスの場合 sendMessage が送信されないこと", async () => {
    await setupActiveSession();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "!echo hello{Enter}");

    expect(postMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: "sendMessage" }));
  });

  // ! only (no command) does not send
  it("! のみでは送信されないこと", async () => {
    await setupActiveSession();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "!{Enter}");

    expect(postMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: "executeShell" }));
    expect(postMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: "sendMessage" }));
  });

  // Shell mode indicator appears when typing !
  context("! を入力した場合", () => {
    beforeEach(async () => {
      await setupActiveSession();
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "!");
    });

    // Shell mode indicator is displayed
    it("シェルモードインジケーターが表示されること", () => {
      expect(screen.getByText("Shell mode")).toBeInTheDocument();
    });

    // Placeholder changes to shell-specific text
    it("プレースホルダーがシェルコマンド用に変わること", () => {
      expect(screen.getByPlaceholderText("Enter shell command...")).toBeInTheDocument();
    });
  });

  // Shell mode indicator disappears when ! is removed
  context("! を削除した場合", () => {
    beforeEach(async () => {
      await setupActiveSession();
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "!");
      await user.clear(textarea);
    });

    // Shell mode indicator is hidden
    it("シェルモードインジケーターが非表示になること", () => {
      expect(screen.queryByText("Shell mode")).not.toBeInTheDocument();
    });
  });

  // Text without ! prefix sends normal message
  it("! なしのテキストは通常の sendMessage として送信されること", async () => {
    const session = await setupActiveSession();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "Hello world{Enter}");

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "sendMessage",
        sessionId: session.id,
        text: "Hello world",
      }),
    );
    expect(postMessage).not.toHaveBeenCalledWith(expect.objectContaining({ type: "executeShell" }));
  });

  // executeShell includes selectedModel
  it("executeShell に selectedModel が含まれること", async () => {
    renderApp();

    const provider = createProvider("anthropic", {
      "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } },
    });
    await sendExtMessage({
      type: "providers",
      providers: [provider],
      allProviders: createAllProvidersData(
        ["anthropic"],
        [
          {
            id: "anthropic",
            name: "Anthropic",
            models: {
              "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } },
            },
          },
        ],
      ),
      default: { general: "anthropic/claude-4-opus" },
      configModel: "anthropic/claude-4-opus",
    });

    const session = createSession({ id: "s1" });
    await sendExtMessage({ type: "activeSession", session });
    vi.mocked(postMessage).mockClear();

    const user = userEvent.setup();
    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "!git status{Enter}");

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "executeShell",
        sessionId: "s1",
        command: "git status",
        model: { providerID: "anthropic", modelID: "claude-4-opus" },
      }),
    );
  });

  // Input is cleared after shell command execution
  it("シェルコマンド実行後に入力欄がクリアされること", async () => {
    await setupActiveSession();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "!pwd{Enter}");

    expect(textarea).toHaveValue("");
  });

  // Shell result is rendered with ShellResultView (terminal-style)
  context("シェルコマンドの結果を受信した場合", () => {
    beforeEach(async () => {
      await setupActiveSession();
      const user = userEvent.setup();

      // ! プレフィクスでシェルコマンドを送信
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "!ls{Enter}");

      // サーバーからの応答をシミュレート: user メッセージ（シェルコマンドのトリガー）
      const userMsg = createMessage({ id: "shell-u1", sessionID: "s1", role: "user" });
      await sendExtMessage({
        type: "event",
        event: { type: "message.updated", properties: { info: userMsg } } as any,
      });

      // サーバーからの応答をシミュレート: message.updated（新しい assistant メッセージ）
      const shellMsg = createMessage({ id: "shell-m1", sessionID: "s1", role: "assistant" });
      await sendExtMessage({
        type: "event",
        event: { type: "message.updated", properties: { info: shellMsg } } as any,
      });

      // ツールパート（bash の実行結果）
      const shellPart = createToolPart("bash", {
        messageID: "shell-m1",
        state: {
          status: "completed",
          title: "ls",
          input: { command: "ls" },
          output: "file1.txt\nfile2.txt",
        },
      } as any);
      await sendExtMessage({
        type: "event",
        event: { type: "message.part.updated", properties: { part: shellPart } } as any,
      });
    });

    // Shell result is displayed in terminal style (shows "Shell" header)
    it("ターミナル風のシェル結果ヘッダーが表示されること", () => {
      expect(screen.getByText("Shell")).toBeInTheDocument();
    });

    // Shell output is visible without clicking (expanded by default)
    it("シェル出力がデフォルトで展開表示されること", () => {
      expect(screen.getByText(/file1\.txt/)).toBeInTheDocument();
    });

    // User message bubble is hidden for shell commands
    it("シェルコマンドのユーザー吹き出しが非表示であること", () => {
      // ユーザーメッセージは ShellResultView の "$ command" で表示されるため
      // 通常のユーザー吹き出し（クリックで編集可能な要素）は表示されない
      const userBubbles = document.querySelectorAll("[class*='userBubble']");
      expect(userBubbles).toHaveLength(0);
    });

    // $ prompt is rendered for the command
    it("$ プロンプトとコマンドが表示されること", () => {
      expect(screen.getByText("$")).toBeInTheDocument();
      expect(screen.getByText("ls")).toBeInTheDocument();
    });
  });

  // Shell result with error
  context("シェルコマンドがエラーを返した場合", () => {
    beforeEach(async () => {
      await setupActiveSession();
      const user = userEvent.setup();

      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "!bad-cmd{Enter}");

      const userMsg = createMessage({ id: "err-u1", sessionID: "s1", role: "user" });
      await sendExtMessage({
        type: "event",
        event: { type: "message.updated", properties: { info: userMsg } } as any,
      });

      const shellMsg = createMessage({ id: "err-m1", sessionID: "s1", role: "assistant" });
      await sendExtMessage({
        type: "event",
        event: { type: "message.updated", properties: { info: shellMsg } } as any,
      });

      const shellPart = createToolPart("bash", {
        messageID: "err-m1",
        state: {
          status: "error",
          title: "bad-cmd",
          input: { command: "bad-cmd" },
          error: "command not found: bad-cmd",
        },
      } as any);
      await sendExtMessage({
        type: "event",
        event: { type: "message.part.updated", properties: { part: shellPart } } as any,
      });
    });

    // error message is displayed
    it("エラーメッセージが表示されること", () => {
      expect(screen.getByText("command not found: bad-cmd")).toBeInTheDocument();
    });

    // error styling is applied
    it("エラー用のスタイルが適用されること", () => {
      const errorOutput = document.querySelector("[class*='outputError']");
      expect(errorOutput).toBeInTheDocument();
    });
  });

  // Shell result in running state
  context("シェルコマンドが実行中の場合", () => {
    beforeEach(async () => {
      await setupActiveSession();
      const user = userEvent.setup();

      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "!sleep 30{Enter}");

      const userMsg = createMessage({ id: "run-u1", sessionID: "s1", role: "user" });
      await sendExtMessage({
        type: "event",
        event: { type: "message.updated", properties: { info: userMsg } } as any,
      });

      const shellMsg = createMessage({ id: "run-m1", sessionID: "s1", role: "assistant" });
      await sendExtMessage({
        type: "event",
        event: { type: "message.updated", properties: { info: shellMsg } } as any,
      });

      const shellPart = createToolPart("bash", {
        messageID: "run-m1",
        state: {
          status: "running",
          title: "sleep 30",
          input: { command: "sleep 30" },
        },
      } as any);
      await sendExtMessage({
        type: "event",
        event: { type: "message.part.updated", properties: { part: shellPart } } as any,
      });
    });

    // spinner is displayed
    it("スピナーが表示されること", () => {
      const spinner = document.querySelector("[class*='spinner']");
      expect(spinner).toBeInTheDocument();
    });
  });
});
