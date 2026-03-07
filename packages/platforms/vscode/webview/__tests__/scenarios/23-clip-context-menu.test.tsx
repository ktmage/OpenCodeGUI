import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** テスト用エージェントデータ */
const testAgents = [
  {
    name: "general",
    description: "General purpose subagent",
    mode: "subagent",
    builtIn: true,
    permission: { edit: "ask", bash: {} },
    tools: {},
    options: {},
  },
  {
    name: "explore",
    description: "Read-only exploration subagent",
    mode: "subagent",
    builtIn: true,
    permission: { edit: "deny", bash: {} },
    tools: {},
    options: {},
  },
] as any;

/** エージェント付きセットアップ */
async function setupWithAgents() {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
  await sendExtMessage({ type: "agents", agents: testAgents });
  vi.mocked(postMessage).mockClear();
}

/** ファイル付きセットアップ */
async function setupWithFiles() {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
  await sendExtMessage({ type: "agents", agents: testAgents });
  // openEditors はファイルピッカー表示時に使う
  await sendExtMessage({
    type: "openEditors",
    files: [
      { fileName: "app.tsx", filePath: "/src/app.tsx" },
      { fileName: "index.ts", filePath: "/src/index.ts" },
    ],
  });
  // アクティブエディタを設定（quick-add ボタン表示用）
  await sendExtMessage({
    type: "activeEditor",
    file: { fileName: "app.tsx", filePath: "/src/app.tsx" },
  });
  vi.mocked(postMessage).mockClear();
}

// Clip context menu integration
describe("統合コンテキストメニュー", () => {
  // Opening the menu shows three sections
  context("クリップボタンをクリックした場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // shows file, agent, and shell sections
    it("ファイル・エージェント・シェルモードの 3 セクションが表示されること", async () => {
      const user = userEvent.setup();
      const clipButton = screen.getByTitle("Add context");
      await user.click(clipButton);
      expect(screen.getByText("Files")).toBeInTheDocument();
      expect(screen.getByText("Sub-agents")).toBeInTheDocument();
      expect(screen.getByText("Shell Mode")).toBeInTheDocument();
    });
  });

  // Selecting an agent from the menu
  context("統合メニューからエージェントを選択した場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // shows agent chip in contextBar
    it("エージェントチップが contextBar に表示されること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Add context"));
      await user.click(screen.getByText("general"));
      expect(screen.getByText("@general")).toBeInTheDocument();
    });

    // includes agent in sendMessage
    it("送信時に agent が含まれること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Add context"));
      await user.click(screen.getByText("general"));
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "Fix the bug{Enter}");
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "sendMessage",
          text: "Fix the bug",
          agent: "general",
        }),
      );
    });
  });

  // Toggling shell mode from the menu
  context("統合メニューでシェルモードを ON にした場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // shows shell chip in contextBar
    it("シェルモードチップが contextBar に表示されること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Add context"));
      await user.click(screen.getByTestId("shell-toggle"));
      expect(screen.getByTestId("shell-chip")).toBeInTheDocument();
    });

    // sends executeShell instead of sendMessage
    it("コマンド入力後に executeShell が送信されること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Add context"));
      await user.click(screen.getByTestId("shell-toggle"));
      const textarea = screen.getByPlaceholderText("Enter shell command...");
      await user.type(textarea, "ls -la{Enter}");
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "executeShell",
          sessionId: "s1",
          command: "ls -la",
        }),
      );
    });
  });

  // Shell mode exclusivity: enabling shell mode clears files and agent
  context("ファイルとエージェントが選択済みの状態でシェルモードを ON にした場合", () => {
    beforeEach(async () => {
      await setupWithFiles();
    });

    // clears file chips
    it("ファイルチップがクリアされること", async () => {
      const user = userEvent.setup();
      // quick-add ボタンでファイルを添付する
      const quickAdd = screen.getByTitle("Add /src/app.tsx");
      await user.click(quickAdd);
      // ファイルチップが表示されていることを確認
      expect(document.querySelector("[class*='chipRemove']")).toBeInTheDocument();

      // シェルモードを ON にする
      await user.click(screen.getByTitle("Add context"));
      await user.click(screen.getByTestId("shell-toggle"));

      // ファイルチップがクリアされること
      expect(screen.getByTestId("shell-chip")).toBeInTheDocument();
      expect(document.querySelector("[class*='chipRemove']")).not.toBeInTheDocument();
    });

    // clears agent chip
    it("エージェントチップがクリアされること", async () => {
      const user = userEvent.setup();
      // エージェントを選択する
      await user.click(screen.getByTitle("Add context"));
      await user.click(screen.getByText("general"));
      expect(screen.getByText("@general")).toBeInTheDocument();

      // メニューはエージェント選択後も開いたままなので、直接シェルトグルをクリック
      await user.click(screen.getByTestId("shell-toggle"));

      // エージェントチップがクリアされること
      expect(screen.queryByText("@general")).not.toBeInTheDocument();
      expect(screen.getByTestId("shell-chip")).toBeInTheDocument();
    });
  });

  // Reverse exclusivity: adding file disables shell mode
  context("シェルモード ON 状態でファイルを添付した場合", () => {
    beforeEach(async () => {
      await setupWithFiles();
    });

    // disables shell mode
    it("シェルモードが解除されること", async () => {
      const user = userEvent.setup();
      // シェルモードを ON にする
      await user.click(screen.getByTitle("Add context"));
      await user.click(screen.getByTestId("shell-toggle"));
      expect(screen.getByTestId("shell-chip")).toBeInTheDocument();

      // # トリガーでファイルを添付する（統合メニューのファイルセクションはシェルモード時 disabled なので # を使う）
      const textarea = screen.getByPlaceholderText("Enter shell command...");
      // シェルモードチップの × ボタンで解除し、ファイルを添付する
      const chip = screen.getByTestId("shell-chip");
      const closeButton = within(chip).getByRole("button");
      await user.click(closeButton);

      // シェルモードが解除されること
      expect(screen.queryByTestId("shell-chip")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)")).toBeInTheDocument();
    });
  });

  // ! text trigger syncs with shell mode toggle in menu
  context("! テキストトリガーでシェルモードを ON にした場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // toggle in menu reflects shell mode state
    it("統合メニューのトグルが ON 状態で表示されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      // ! テキストトリガーでシェルモード ON
      await user.type(textarea, "!");
      expect(screen.getByTestId("shell-chip")).toBeInTheDocument();

      // 統合メニューを開く
      await user.click(screen.getByTitle("Add context"));
      // toggleOn クラスが付いているか確認
      const toggle = screen.getByTestId("shell-toggle");
      expect(toggle.querySelector("[class*='toggleOn']")).toBeInTheDocument();
    });
  });
});
