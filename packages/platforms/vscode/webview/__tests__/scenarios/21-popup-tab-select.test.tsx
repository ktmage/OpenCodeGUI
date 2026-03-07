import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** テスト用エージェントデータ */
const testAgents = [
  {
    name: "coder",
    description: "Coding subagent",
    mode: "subagent",
    builtIn: true,
    permission: { edit: "ask", bash: {} },
    tools: {},
    options: {},
  },
  {
    name: "explorer",
    description: "Read-only subagent",
    mode: "subagent",
    builtIn: true,
    permission: { edit: "deny", bash: {} },
    tools: {},
    options: {},
  },
] as any;

/** ファイル候補付きセットアップ */
async function setupWithFiles() {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
  await sendExtMessage({
    type: "openEditors",
    files: [
      { filePath: "src/main.ts", fileName: "main.ts" },
      { filePath: "src/utils.ts", fileName: "utils.ts" },
    ],
  });
  await sendExtMessage({
    type: "workspaceFiles",
    files: [
      { filePath: "src/main.ts", fileName: "main.ts" },
      { filePath: "src/utils.ts", fileName: "utils.ts" },
      { filePath: "src/config.ts", fileName: "config.ts" },
    ],
  });
  await sendExtMessage({ type: "agents", agents: testAgents });
  vi.mocked(postMessage).mockClear();
}

// Tab selection in inline popups
describe("ポップアップの Tab 選択", () => {
  beforeEach(async () => {
    await setupWithFiles();
  });

  // # popup: Tab moves focus through items
  context("# ポップアップで Tab を押した場合", () => {
    // first item gets focused
    it("先頭のアイテムにフォーカスが当たること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "#");
      await user.keyboard("{Tab}");
      const popup = document.querySelector("[data-testid='hash-popup']");
      const items = popup?.querySelectorAll(":scope > div");
      expect(items?.[0]?.getAttribute("data-focused")).toBe("true");
    });

    // Tab again moves to second item
    it("もう一度 Tab を押すと 2 番目のアイテムにフォーカスが移ること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "#");
      await user.keyboard("{Tab}");
      await user.keyboard("{Tab}");
      const popup = document.querySelector("[data-testid='hash-popup']");
      const items = popup?.querySelectorAll(":scope > div");
      expect(items?.[1]?.getAttribute("data-focused")).toBe("true");
    });
  });

  // # popup: Tab + Enter selects the focused item
  context("# ポップアップで Tab でフォーカス後 Enter で確定した場合", () => {
    // file is attached and popup closes
    it("ファイルが添付されポップアップが閉じること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "#");
      await user.keyboard("{Tab}");
      await user.keyboard("{Enter}");
      // ポップアップが閉じる
      expect(document.querySelector("[data-testid='hash-popup']")).toBeFalsy();
      // ファイルチップが表示される
      expect(document.querySelectorAll(".chip").length).toBe(1);
    });
  });

  // # popup: ArrowDown moves focus
  context("# ポップアップで ↓ キーを押した場合", () => {
    // second item gets focused
    it("次のアイテムにフォーカスが移ること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "#");
      await user.keyboard("{ArrowDown}");
      const popup = document.querySelector("[data-testid='hash-popup']");
      const items = popup?.querySelectorAll(":scope > div");
      expect(items?.[0]?.getAttribute("data-focused")).toBe("true");
    });

    // pressing ArrowDown again moves to second item
    it("もう一度 ↓ を押すと2番目のアイテムにフォーカスが移ること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "#");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      const popup = document.querySelector("[data-testid='hash-popup']");
      const items = popup?.querySelectorAll(":scope > div");
      expect(items?.[1]?.getAttribute("data-focused")).toBe("true");
    });
  });

  // # popup: ArrowUp wraps to last item
  context("# ポップアップで ↑ キーを押した場合", () => {
    // wraps to last item
    it("末尾のアイテムにフォーカスが移ること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "#");
      await user.keyboard("{ArrowUp}");
      const popup = document.querySelector("[data-testid='hash-popup']");
      const items = popup?.querySelectorAll(":scope > div");
      const lastItem = items?.[items.length - 1];
      expect(lastItem?.getAttribute("data-focused")).toBe("true");
    });
  });

  // # popup: Enter on focused item selects it
  context("# ポップアップでフォーカス済みアイテムで Enter を押した場合", () => {
    // file is attached and popup closes
    it("ファイルが添付されポップアップが閉じること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "#");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");
      // ポップアップが閉じる
      expect(document.querySelector("[data-testid='hash-popup']")).toBeFalsy();
      // ファイルチップが表示される
      expect(document.querySelectorAll(".chip").length).toBe(1);
    });
  });

  // # popup: Enter without focus sends message
  context("# ポップアップ表示中にフォーカスなしで Enter を押した場合", () => {
    // sends the message (existing behavior)
    it("メッセージが送信されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "hello #");
      await user.keyboard("{Enter}");
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "sendMessage",
          text: "hello #",
        }),
      );
    });
  });

  // # popup: query change resets focus
  context("# ポップアップでクエリを変更した場合", () => {
    // focus resets
    it("フォーカスがリセットされること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "#");
      await user.keyboard("{ArrowDown}");
      // フォーカスが当たっている
      let popup = document.querySelector("[data-testid='hash-popup']");
      expect(popup?.querySelector("[data-focused]")).toBeTruthy();
      // クエリを入力するとフォーカスリセット
      await user.type(textarea, "m");
      popup = document.querySelector("[data-testid='hash-popup']");
      expect(popup?.querySelector("[data-focused]")).toBeFalsy();
    });
  });

  // @ popup: Tab moves focus through agents
  context("@ ポップアップで Tab を押した場合", () => {
    // first agent gets focused
    it("先頭のエージェントにフォーカスが当たること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.keyboard("{Tab}");
      const popup = document.querySelector("[data-testid='agent-popup']");
      const items = popup?.querySelectorAll(":scope > div");
      expect(items?.[0]?.getAttribute("data-focused")).toBe("true");
    });

    // Tab again moves to second agent
    it("もう一度 Tab を押すと 2 番目のエージェントにフォーカスが移ること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.keyboard("{Tab}");
      await user.keyboard("{Tab}");
      const popup = document.querySelector("[data-testid='agent-popup']");
      const items = popup?.querySelectorAll(":scope > div");
      expect(items?.[1]?.getAttribute("data-focused")).toBe("true");
    });
  });

  // @ popup: Tab + Enter selects the focused agent
  context("@ ポップアップで Tab でフォーカス後 Enter で確定した場合", () => {
    // agent is selected and popup closes
    it("エージェントが選択されポップアップが閉じること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.keyboard("{Tab}");
      await user.keyboard("{Enter}");
      expect(screen.queryByTestId("agent-popup")).not.toBeInTheDocument();
      expect(screen.getByText("@coder")).toBeInTheDocument();
    });
  });

  // @ popup: Enter on focused agent selects it
  context("@ ポップアップでフォーカス済みエージェントで Enter を押した場合", () => {
    // agent is selected
    it("エージェントが選択されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{Enter}");
      expect(screen.queryByTestId("agent-popup")).not.toBeInTheDocument();
      expect(screen.getByText("@coder")).toBeInTheDocument();
    });
  });

  // @ popup: ArrowDown/ArrowUp navigation
  context("@ ポップアップで ↓↑ キーで移動した場合", () => {
    // ArrowDown then ArrowUp returns to first
    it("↓ で 2 番目、↑ で 1 番目に戻ること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowDown}");
      const popup = document.querySelector("[data-testid='agent-popup']");
      expect(popup?.querySelectorAll(":scope > div")[1]?.getAttribute("data-focused")).toBe("true");
      await user.keyboard("{ArrowUp}");
      expect(popup?.querySelectorAll(":scope > div")[0]?.getAttribute("data-focused")).toBe("true");
    });
  });
});
