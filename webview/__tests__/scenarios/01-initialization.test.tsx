import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createProvider, createAllProvidersData } from "../factories";

// 01 Initialization
describe("01 初期化", () => {
  // Sends ready and getOpenEditors on mount
  it("マウント時に ready と getOpenEditors を送信する", () => {
    renderApp();

    expect(postMessage).toHaveBeenCalledWith({ type: "ready" });
    expect(postMessage).toHaveBeenCalledWith({ type: "getOpenEditors" });
  });

  // Receives session list via sessions message
  it("sessions メッセージでセッションリストが受信される", async () => {
    renderApp();

    const sessions = [createSession({ title: "My Session" }), createSession({ title: "Another" })];
    await sendExtMessage({ type: "sessions", sessions });

    // セッションリストを開いて確認する
    const toggleButton = screen.getByTitle("Sessions");
    await vi.dynamicImportSettled();
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    await user.click(toggleButton);

    expect(screen.getByText("My Session")).toBeInTheDocument();
    expect(screen.getByText("Another")).toBeInTheDocument();
  });

  // Selects model from configModel via providers message
  it("providers メッセージで configModel からモデルが選択される", async () => {
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

    // アクティブセッションを設定してモデルセレクターを表示する
    await sendExtMessage({ type: "activeSession", session: createSession() });

    expect(screen.getByText("Claude 4 Opus")).toBeInTheDocument();
  });

  // Falls back to default when configModel is absent
  it("configModel なしの場合 default でフォールバックする", async () => {
    renderApp();

    const provider = createProvider("openai", {
      "gpt-5": { id: "gpt-5", name: "GPT-5", limit: { context: 128000, output: 4096 } },
    });

    await sendExtMessage({
      type: "providers",
      providers: [provider],
      allProviders: createAllProvidersData(["openai"], [
        { id: "openai", name: "OpenAI", models: { "gpt-5": { id: "gpt-5", name: "GPT-5", limit: { context: 128000, output: 4096 } } } },
      ]),
      default: { general: "openai/gpt-5" },
    });

    await sendExtMessage({ type: "activeSession", session: createSession() });

    expect(screen.getByText("GPT-5")).toBeInTheDocument();
  });

  // Switches to Japanese via locale message
  it("locale メッセージで日本語に切り替わる", async () => {
    renderApp();

    await sendExtMessage({ type: "locale", vscodeLanguage: "ja" });

    // EmptyState（セッションなし初期状態）のテキストが日本語になる
    expect(screen.getByText("新しい会話を始めましょう。")).toBeInTheDocument();
  });
});
