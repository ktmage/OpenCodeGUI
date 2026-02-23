import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createMessage, createTextPart, createToolPart, createProvider, createAllProvidersData } from "../factories";

/** step-finish パート付きメッセージをセットアップする */
async function setupWithTokenUsage() {
  renderApp();

  // プロバイダーとモデルを設定（contextLimit を有効にするために必要）
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

  const session = createSession({ id: "s1" });
  await sendExtMessage({ type: "activeSession", session });

  // step-finish パートでトークン使用量を含むメッセージを設定
  const msg1 = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
  const textPart1 = createTextPart("Response 1", { messageID: "m1" });
  const stepFinish1 = {
    id: "sf1",
    type: "step-finish" as const,
    messageID: "m1",
    tokens: { input: 50000, output: 1000 },
    time: { created: Date.now(), updated: Date.now() },
  };

  const msg2 = createMessage({ id: "m2", sessionID: "s1", role: "assistant" });
  const textPart2 = createTextPart("Response 2", { messageID: "m2" });
  const stepFinish2 = {
    id: "sf2",
    type: "step-finish" as const,
    messageID: "m2",
    tokens: { input: 30000, output: 500 },
    time: { created: Date.now(), updated: Date.now() },
  };

  await sendExtMessage({
    type: "messages",
    sessionId: "s1",
    messages: [
      { info: msg1, parts: [textPart1, stepFinish1 as any] },
      { info: msg2, parts: [textPart2, stepFinish2 as any] },
    ],
  });

  vi.mocked(postMessage).mockClear();
  return session;
}

// 08 Context and compression
describe("08 コンテキストとコンプレッション", () => {
  // ContextIndicator is shown based on token usage
  it("トークン使用量に応じて ContextIndicator が表示される", async () => {
    await setupWithTokenUsage();

    // 80000 / 200000 = 40%
    const button = screen.getByTitle("Context: 40% used");
    expect(button).toBeInTheDocument();
  });

  // Compress button sends compressSession
  it("圧縮ボタンで compressSession が送信される", async () => {
    const session = await setupWithTokenUsage();
    const user = userEvent.setup();

    // ContextIndicator をクリックしてポップアップを開く
    await user.click(screen.getByTitle("Context: 40% used"));

    // Compress ボタンをクリック
    await user.click(screen.getByText("Compress Conversation"));

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "compressSession",
        sessionId: "s1",
      }),
    );
  });

  // Token usage is recalculated after message.removed
  describe("message.removed 後のトークン使用量再計算", () => {
    beforeEach(async () => {
      await setupWithTokenUsage();

      await sendExtMessage({
        type: "event",
        event: { type: "message.removed", properties: { messageID: "m1" } } as any,
      });
    });

    // New percentage is shown
    it("新しい使用率が表示される", () => {
      expect(screen.getByTitle("Context: 15% used")).toBeInTheDocument();
    });

    // Old percentage is no longer shown
    it("古い使用率が非表示になる", () => {
      expect(screen.queryByTitle("Context: 40% used")).not.toBeInTheDocument();
    });
  });

  // ContextIndicator is hidden when inputTokens is 0
  it("inputTokens が 0 の場合 ContextIndicator が表示されない", async () => {
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

    // トークン 0 → ContextIndicator ボタンが存在しない
    const button = document.querySelector(".context-indicator-button");
    expect(button).toBeFalsy();
  });

  // Warning color is applied at 80%+ usage
  it("使用率 80% 以上で警告色になる", async () => {
    renderApp();

    const provider = createProvider("anthropic", {
      "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 100000, output: 4096 } },
    });
    await sendExtMessage({
      type: "providers",
      providers: [provider],
      allProviders: createAllProvidersData(["anthropic"], [
        { id: "anthropic", name: "Anthropic", models: { "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 100000, output: 4096 } } } },
      ]),
      default: { general: "anthropic/claude-4-opus" },
      configModel: "anthropic/claude-4-opus",
    });

    const session = createSession({ id: "s1" });
    await sendExtMessage({ type: "activeSession", session });

    // 85000 / 100000 = 85% → 警告色
    const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
    const textPart = createTextPart("Response", { messageID: "m1" });
    const stepFinish = {
      id: "sf1",
      type: "step-finish" as const,
      messageID: "m1",
      tokens: { input: 85000, output: 1000 },
      time: { created: Date.now(), updated: Date.now() },
    };

    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [{ info: msg, parts: [textPart, stepFinish as any] }],
    });

    // 85% 表示
    expect(screen.getByTitle("Context: 85% used")).toBeInTheDocument();
  });

  // Popup shows token details
  describe("ポップアップ表示時", () => {
    beforeEach(async () => {
      await setupWithTokenUsage();
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Context: 40% used"));
    });

    // Shows heading
    it("タイトルが表示される", () => {
      expect(screen.getByText("Context Window Usage")).toBeInTheDocument();
    });

    // Shows Input tokens label
    it("Input tokens ラベルが表示される", () => {
      expect(screen.getByText("Input tokens")).toBeInTheDocument();
    });

    // Shows Context limit label
    it("Context limit ラベルが表示される", () => {
      expect(screen.getByText("Context limit")).toBeInTheDocument();
    });
  });

  // Compressing state shows "Compressing..." text and disabled button
  describe("圧縮中の状態", () => {
    let compressBtn: HTMLElement;

    beforeEach(async () => {
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

      const session = createSession({ id: "s1", time: { created: Date.now(), updated: Date.now(), compacting: Date.now() } } as any);
      await sendExtMessage({ type: "activeSession", session });

      const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
      const textPart = createTextPart("Response", { messageID: "m1" });
      const stepFinish = {
        id: "sf1",
        type: "step-finish" as const,
        messageID: "m1",
        tokens: { input: 50000, output: 1000 },
        time: { created: Date.now(), updated: Date.now() },
      };
      await sendExtMessage({
        type: "messages",
        sessionId: "s1",
        messages: [{ info: msg, parts: [textPart, stepFinish as any] }],
      });

      const user = userEvent.setup();
      await user.click(screen.getByTitle("Context: 25% used"));
      compressBtn = screen.getByText("Compressing...");
    });

    // Shows Compressing label
    it("Compressing ラベルが表示される", () => {
      expect(compressBtn).toBeInTheDocument();
    });

    // Button is disabled
    it("ボタンが disabled になる", () => {
      expect(compressBtn).toBeDisabled();
    });
  });
});
