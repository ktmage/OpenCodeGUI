import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createProvider, createAllProvidersData } from "../factories";

/** プロバイダー付きアクティブセッションをセットアップする */
async function setupWithProviders() {
  renderApp();

  const anthropic = createProvider("anthropic", {
    "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } },
    "claude-4-sonnet": { id: "claude-4-sonnet", name: "Claude 4 Sonnet", limit: { context: 200000, output: 4096 } },
  });
  const openai = createProvider("openai", {
    "gpt-5": { id: "gpt-5", name: "GPT-5", limit: { context: 128000, output: 4096 } },
  });

  const allProviders = createAllProvidersData(
    ["anthropic"],
    [
      {
        id: "anthropic",
        name: "Anthropic",
        models: {
          "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } },
          "claude-4-sonnet": { id: "claude-4-sonnet", name: "Claude 4 Sonnet", limit: { context: 200000, output: 4096 } },
        },
      },
      {
        id: "openai",
        name: "OpenAI",
        models: {
          "gpt-5": { id: "gpt-5", name: "GPT-5", limit: { context: 128000, output: 4096 } },
        },
      },
    ],
    { general: "anthropic/claude-4-opus" },
  );

  await sendExtMessage({
    type: "providers",
    providers: [anthropic],
    allProviders,
    default: { general: "anthropic/claude-4-opus" },
    configModel: "anthropic/claude-4-opus",
  });

  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
  vi.mocked(postMessage).mockClear();
}

// Model selection
describe("モデル選択", () => {
  // Selected model name is shown on the button
  it("選択中のモデル名がボタンに表示されること", async () => {
    await setupWithProviders();

    expect(screen.getByText("Claude 4 Opus")).toBeInTheDocument();
  });

  // Clicking opens the model panel
  it("クリックでモデルパネルが開くこと", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    await user.click(screen.getByText("Claude 4 Opus"));

    // パネル内にモデル一覧が表示される
    expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();
  });

  // Selecting a model sends setModel
  it("モデル選択で setModel が送信されること", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    await user.click(screen.getByText("Claude 4 Opus"));
    await user.click(screen.getByText("Claude 4 Sonnet"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "setModel",
      model: "anthropic/claude-4-sonnet",
    });
  });

  // modelUpdated message updates the selected model
  it("modelUpdated 受信で選択モデルが更新されること", async () => {
    await setupWithProviders();

    await sendExtMessage({
      type: "modelUpdated",
      model: "anthropic/claude-4-sonnet",
      default: { general: "anthropic/claude-4-opus" },
    });

    // ボタンのラベルが更新される
    expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();
  });

  // Disconnected providers show "Not connected" badge
  it("未接続プロバイダーは Not connected バッジが表示されること", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    // モデルパネルを開く
    await user.click(screen.getByText("Claude 4 Opus"));

    // 「Show all providers」リンクをクリック
    const showAllButton = screen.getByTitle("Show all providers");
    await user.click(showAllButton);

    // OpenAI は未接続なので Not connected バッジ
    expect(screen.getByText("Not connected")).toBeInTheDocument();
  });

  // Clicking provider name toggles model list fold/unfold
  context("プロバイダー名をクリックした場合", () => {
    // After folding, models are hidden
    context("折りたたんだ場合", () => {
      beforeEach(async () => {
        await setupWithProviders();
        const user = userEvent.setup();
        await user.click(screen.getByText("Claude 4 Opus"));
        await user.click(screen.getByText("Anthropic"));
      });

      // Models are hidden
      it("モデルが非表示になること", () => {
        expect(screen.queryByText("Claude 4 Sonnet")).not.toBeInTheDocument();
      });

      // After unfolding, models are shown again
      context("再度クリックした場合", () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.click(screen.getByText("Anthropic"));
        });

        // Models are shown
        it("モデルが再表示されること", () => {
          expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();
        });
      });
    });
  });

  // "Show all providers" toggle shows/hides disconnected providers
  context("Show all providers をトグルする場合", () => {
    // Initially disconnected providers are hidden
    context("初期状態の場合", () => {
      beforeEach(async () => {
        await setupWithProviders();
        const user = userEvent.setup();
        await user.click(screen.getByText("Claude 4 Opus"));
      });

      // Disconnected providers are hidden
      it("未接続プロバイダーが非表示こと", () => {
        expect(screen.queryByText("OpenAI")).not.toBeInTheDocument();
      });

      // After clicking Show all, disconnected providers appear
      context("Show all をクリックした場合", () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.click(screen.getByTitle("Show all providers"));
        });

        // Disconnected providers are shown
        it("未接続プロバイダーが表示されること", () => {
          expect(screen.getByText("OpenAI")).toBeInTheDocument();
        });

        // After clicking Connected only, disconnected providers are hidden again
        context("Connected only をクリックした場合", () => {
          beforeEach(async () => {
            const user = userEvent.setup();
            await user.click(screen.getByTitle("Hide disconnected providers"));
          });

          // Disconnected providers are hidden again
          it("未接続プロバイダーが再び非表示になること", () => {
            expect(screen.queryByText("OpenAI")).not.toBeInTheDocument();
          });
        });
      });
    });
  });

  // Dropdown closes after model selection
  it("モデル選択後にドロップダウンが閉じること", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    await user.click(screen.getByText("Claude 4 Opus"));
    expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();

    await user.click(screen.getByText("Claude 4 Sonnet"));

    // パネルが閉じている（モデルパネル内のセクションタイトルが消える）
    expect(screen.queryByText("Anthropic")).not.toBeInTheDocument();
  });

  // Shows "Select model" when selectedModel is null
  it("selectedModel が null のとき Select model が表示されること", async () => {
    renderApp();

    // プロバイダーなしで activeSession を設定
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

    expect(screen.getByText("Select model")).toBeInTheDocument();
  });
});
