import { describe, it, expect, vi } from "vitest";
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

describe("13 キーボード・IME ハンドリング", () => {
  it("IME 変換中に Enter を押しても送信されない", async () => {
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

  it("Shift+Enter で送信されず改行が入力される", async () => {
    await setupInputReady();

    const user = userEvent.setup();
    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");

    // テキストを入力して Shift+Enter
    await user.type(textarea, "line1{Shift>}{Enter}{/Shift}line2");

    // sendMessage は呼ばれない
    const sendCalls = vi.mocked(postMessage).mock.calls.filter(
      (call) => call[0] && typeof call[0] === "object" && "type" in call[0] && call[0].type === "sendMessage",
    );
    expect(sendCalls).toHaveLength(0);

    // textarea にテキストが残っている
    expect(textarea).toHaveValue("line1\nline2");
  });

  it("isBusy 状態で Enter を押しても送信されない", async () => {
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
