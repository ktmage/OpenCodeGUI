import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createProvider, createAllProvidersData } from "../factories";

// Initialization
describe("初期化", () => {
  // On mount
  context("マウントした場合", () => {
    // Sends ready on mount
    it("ready を送信すること", () => {
      renderApp();

      expect(postMessage).toHaveBeenCalledWith({ type: "ready" });
    });

    // Sends getOpenEditors on mount
    it("getOpenEditors を送信すること", () => {
      renderApp();

      expect(postMessage).toHaveBeenCalledWith({ type: "getOpenEditors" });
    });
  });

  // When sessions message is received
  context("sessions メッセージを受信した場合", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(async () => {
      renderApp();
      const sessions = [createSession({ title: "My Session" }), createSession({ title: "Another" })];
      await sendExtMessage({ type: "sessions", sessions });

      user = userEvent.setup();
      await user.click(screen.getByTitle("Sessions"));
    });

    // First session is displayed
    it("最初のセッションが表示されること", () => {
      expect(screen.getByText("My Session")).toBeInTheDocument();
    });

    // Second session is displayed
    it("2番目のセッションが表示されること", () => {
      expect(screen.getByText("Another")).toBeInTheDocument();
    });
  });

  // When providers message has configModel
  context("providers メッセージに configModel がある場合", () => {
    // Selects model from configModel
    it("configModel からモデルが選択されること", async () => {
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

      await sendExtMessage({ type: "activeSession", session: createSession() });

      expect(screen.getByText("Claude 4 Opus")).toBeInTheDocument();
    });
  });

  // When configModel is absent
  context("configModel がない場合", () => {
    // Falls back to default model
    it("default でフォールバックすること", async () => {
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
  });

  // When locale message sets Japanese
  context("locale メッセージで日本語を設定した場合", () => {
    // Switches UI to Japanese
    it("EmptyState が日本語になること", async () => {
      renderApp();

      await sendExtMessage({ type: "locale", vscodeLanguage: "ja" });

      expect(screen.getByText("新しい会話を始めましょう。")).toBeInTheDocument();
    });
  });
});
