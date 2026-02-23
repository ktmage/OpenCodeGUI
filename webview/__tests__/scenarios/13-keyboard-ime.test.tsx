import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createProvider, createAllProvidersData } from "../factories";

/** アクティブセッション + プロバイダ付きで InputArea が操作可能な状態にする */
async function setupInputReady() {
  renderApp();
  const provider = createProvider("anthropic", {
    "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } },
  });
  await sendExtMessage({
    type: "providers",
    providers: [provider],
    allProviders: createAllProvidersData(["anthropic"], [
      { id: "anthropic", name: "Anthropic", models: { "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } } } },
    ]),
    default: { general: "anthropic/claude-4-opus" },
    configModel: "anthropic/claude-4-opus",
  });
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
}

// Keyboard and IME handling
describe("キーボード・IME ハンドリング", () => {
  // Enter during IME composition does not send
  it("IME 変換中に Enter を押しても送信されないこと", async () => {
    await setupInputReady();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");

    // テキストを入力
    await userEvent.type(textarea, "hello");

    // IME 変換開始
    fireEvent.compositionStart(textarea);

    // IME 変換中に Enter
    fireEvent.keyDown(textarea, { key: "Enter" });

    // IME 変換終了
    fireEvent.compositionEnd(textarea);

    // sendMessage が呼ばれていないことを確認
    const sendCalls = vi.mocked(postMessage).mock.calls.filter(
      (call) => call[0] && typeof call[0] === "object" && "type" in call[0] && call[0].type === "sendMessage",
    );
    expect(sendCalls).toHaveLength(0);
  });

  // Shift+Enter inserts newline without sending
  context("Shift+Enter を入力した場合", () => {
    let textarea: HTMLElement;

    beforeEach(async () => {
      await setupInputReady();
      const user = userEvent.setup();
      textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "line1{Shift>}{Enter}{/Shift}line2");
    });

    // Does not send
    it("sendMessage が呼ばれないこと", () => {
      const sendCalls = vi.mocked(postMessage).mock.calls.filter(
        (call) => call[0] && typeof call[0] === "object" && "type" in call[0] && call[0].type === "sendMessage",
      );
      expect(sendCalls).toHaveLength(0);
    });

    // Newline is inserted
    it("改行が入力されること", () => {
      expect(textarea).toHaveValue("line1\nline2");
    });
  });

  // Enter does not send while isBusy
  it("isBusy 状態で Enter を押しても送信されないこと", async () => {
    await setupInputReady();

    const user = userEvent.setup();
    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");

    // テキスト入力
    await user.type(textarea, "test message");

    // isBusy 状態にする: session.status busy を送る
    await sendExtMessage({ type: "event", event: { type: "session.status", properties: { sessionID: "s1", status: { type: "busy" } } } as any });

    // Enter を押す
    await user.keyboard("{Enter}");

    // sendMessage が呼ばれていないことを確認
    const sendCalls = vi.mocked(postMessage).mock.calls.filter(
      (call) => call[0] && typeof call[0] === "object" && "type" in call[0] && call[0].type === "sendMessage",
    );
    expect(sendCalls).toHaveLength(0);
  });
});
