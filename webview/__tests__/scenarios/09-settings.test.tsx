import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage, setPersistedState } from "../../vscode-api";
import { createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** 設定パネル用のアクティブセッションをセットアップする */
async function setupForSettings() {
  renderApp();
  const session = createSession({ id: "s1" });
  await sendExtMessage({ type: "activeSession", session });

  // toolConfig パスを設定
  await sendExtMessage({
    type: "toolConfig",
    paths: {
      home: "/home/user",
      config: "/home/user/.config/opencode",
      state: "/home/user/.local/state/opencode",
      directory: "/workspace",
    },
  });

  vi.mocked(postMessage).mockClear();
}

// Settings
describe("設定", () => {
  // Settings button opens/closes ToolConfigPanel
  it("設定ボタンで ToolConfigPanel が開閉すること", async () => {
    await setupForSettings();
    const user = userEvent.setup();

    // 設定ボタンをクリック
    await user.click(screen.getByTitle("Settings"));

    // パネルが開く
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  // Changing locale updates persisted state
  it("ロケール変更で persisted state が更新されること", async () => {
    await setupForSettings();
    const user = userEvent.setup();

    // 設定パネルを開く
    await user.click(screen.getByTitle("Settings"));

    // 「日本語」ラジオボタンをクリック
    await user.click(screen.getByText("日本語"));

    expect(setPersistedState).toHaveBeenCalledWith(expect.objectContaining({ localeSetting: "ja" }));
  });

  // Config file link sends openConfigFile
  it("設定ファイルリンクで openConfigFile が送信されること", async () => {
    await setupForSettings();
    const user = userEvent.setup();

    await user.click(screen.getByTitle("Settings"));

    // グローバル設定をクリック
    await user.click(screen.getByText("Global Config"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "openConfigFile",
      filePath: "/home/user/.config/opencode/opencode.json",
    });
  });

  // Project config file link sends openConfigFile
  it("プロジェクト設定ファイルリンクで openConfigFile が送信されること", async () => {
    await setupForSettings();
    const user = userEvent.setup();

    await user.click(screen.getByTitle("Settings"));

    await user.click(screen.getByText("Project Config"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "openConfigFile",
      filePath: "/workspace/opencode.json",
    });
  });

  // Terminal button sends openTerminal
  it("ターミナルボタンで openTerminal が送信されること", async () => {
    await setupForSettings();
    const user = userEvent.setup();

    await user.click(screen.getByTitle("Open in terminal"));

    expect(postMessage).toHaveBeenCalledWith({ type: "openTerminal" });
  });

  // Switching locale to Japanese updates UI text
  it("ロケールを日本語に変えるとUIが日本語になること", async () => {
    await setupForSettings();
    const user = userEvent.setup();

    // 設定パネルを開いて日本語に変更
    await user.click(screen.getByTitle("Settings"));
    await user.click(screen.getByText("日本語"));

    // ヘッダーの「New chat」が「新しいチャット」になる
    expect(screen.getByTitle("新しいチャット")).toBeInTheDocument();
  });

  // toolConfig message sets paths and shows config links in the panel
  context("toolConfig メッセージを受信した場合", () => {
    beforeEach(async () => {
      renderApp();
      const session = createSession({ id: "s1" });
      await sendExtMessage({ type: "activeSession", session });

      await sendExtMessage({
        type: "toolConfig",
        paths: { home: "/h", config: "/c", state: "/s", directory: "/d" },
      });

      const user = userEvent.setup();
      await user.click(screen.getByTitle("Settings"));
    });

    // Shows Project Config link
    it("Project Config リンクが表示されること", () => {
      expect(screen.getByText("Project Config")).toBeInTheDocument();
    });

    // Shows Global Config link
    it("Global Config リンクが表示されること", () => {
      expect(screen.getByText("Global Config")).toBeInTheDocument();
    });
  });
});
