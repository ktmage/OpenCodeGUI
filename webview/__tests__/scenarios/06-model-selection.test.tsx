import { describe, it, expect, vi } from "vitest";
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

describe("06 モデル選択", () => {
  it("選択中のモデル名がボタンに表示される", async () => {
    await setupWithProviders();

    expect(screen.getByText("Claude 4 Opus")).toBeInTheDocument();
  });

  it("クリックでモデルパネルが開く", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    await user.click(screen.getByText("Claude 4 Opus"));

    // パネル内にモデル一覧が表示される
    expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();
  });

  it("モデル選択で setModel が送信される", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    await user.click(screen.getByText("Claude 4 Opus"));
    await user.click(screen.getByText("Claude 4 Sonnet"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "setModel",
      model: "anthropic/claude-4-sonnet",
    });
  });

  it("modelUpdated 受信で選択モデルが更新される", async () => {
    await setupWithProviders();

    await sendExtMessage({
      type: "modelUpdated",
      model: "anthropic/claude-4-sonnet",
      default: { general: "anthropic/claude-4-opus" },
    });

    // ボタンのラベルが更新される
    expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();
  });

  it("未接続プロバイダーは Not connected バッジが表示される", async () => {
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

  it("プロバイダー名クリックでモデル一覧が折りたたまれる", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    // モデルパネルを開く
    await user.click(screen.getByText("Claude 4 Opus"));
    expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();

    // Anthropic プロバイダーヘッダーをクリックして折りたたむ
    await user.click(screen.getByText("Anthropic"));
    expect(screen.queryByText("Claude 4 Sonnet")).not.toBeInTheDocument();

    // もう一度クリックで展開
    await user.click(screen.getByText("Anthropic"));
    expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();
  });

  it("Show all providers トグルで未接続プロバイダーが表示・非表示される", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    await user.click(screen.getByText("Claude 4 Opus"));

    // 初期状態では接続済みのみ → OpenAI は非表示
    expect(screen.queryByText("OpenAI")).not.toBeInTheDocument();

    // Show all をクリック
    await user.click(screen.getByTitle("Show all providers"));
    expect(screen.getByText("OpenAI")).toBeInTheDocument();

    // Connected only をクリックして戻す
    await user.click(screen.getByTitle("Hide disconnected providers"));
    expect(screen.queryByText("OpenAI")).not.toBeInTheDocument();
  });

  it("モデル選択後にドロップダウンが閉じる", async () => {
    await setupWithProviders();
    const user = userEvent.setup();

    await user.click(screen.getByText("Claude 4 Opus"));
    expect(screen.getByText("Claude 4 Sonnet")).toBeInTheDocument();

    await user.click(screen.getByText("Claude 4 Sonnet"));

    // パネルが閉じている（モデルパネル内のセクションタイトルが消える）
    expect(screen.queryByText("Anthropic")).not.toBeInTheDocument();
  });

  it("selectedModel が null のとき Select model が表示される", async () => {
    renderApp();

    // プロバイダーなしで activeSession を設定
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

    expect(screen.getByText("Select model")).toBeInTheDocument();
  });
});
