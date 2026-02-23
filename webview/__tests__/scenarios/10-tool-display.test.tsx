import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createMessage } from "../factories";
import type { ToolPart } from "@opencode-ai/sdk";

/** ツール表示テスト用のセットアップ。指定した toolPart を持つアシスタントメッセージを表示する。 */
async function setupWithToolPart(toolPart: unknown) {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

  const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
  await sendExtMessage({
    type: "messages",
    sessionId: "s1",
    messages: [{ info: msg, parts: [toolPart as any] }],
  });
}

// Tool display
describe("ツール表示", () => {
  // "read" category tool shows "Read" label
  context("read カテゴリのツールを表示した場合", () => {
    beforeEach(async () => {
      await setupWithToolPart({
        id: "tp1",
        type: "tool",
        tool: "read",
        messageID: "m1",
        time: { created: Date.now(), updated: Date.now() },
        state: { status: "completed", title: "src/main.ts", input: { filePath: "src/main.ts" }, output: "file content" },
      });
    });

    // Shows Read label
    it("Read ラベルが表示されること", () => {
      expect(screen.getByText("Read")).toBeInTheDocument();
    });

    // Shows file path
    it("ファイルパスが表示されること", () => {
      expect(screen.getByText("src/main.ts")).toBeInTheDocument();
    });
  });

  // "edit" category tool shows diff view when expanded
  context("edit カテゴリのツールを表示した場合", () => {
    beforeEach(async () => {
      await setupWithToolPart({
        id: "tp1",
        type: "tool",
        tool: "edit",
        messageID: "m1",
        time: { created: Date.now(), updated: Date.now() },
        state: {
          status: "completed",
          title: "src/main.ts",
          input: {
            filePath: "src/main.ts",
            oldString: "const a = 1;",
            newString: "const a = 2;",
          },
          output: "ok",
        },
      });
    });

    // Shows Edit label
    it("Edit ラベルが表示されること", () => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    // Shows diff lines when expanded
    it("展開すると差分行が表示されること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Toggle details"));
      const diffLines = document.querySelectorAll(".tool-diff-line");
      expect(diffLines.length).toBeGreaterThan(0);
    });
  });

  // "write" category tool shows file creation view
  context("write カテゴリのツールを表示した場合", () => {
    beforeEach(async () => {
      await setupWithToolPart({
        id: "tp1",
        type: "tool",
        tool: "write",
        messageID: "m1",
        time: { created: Date.now(), updated: Date.now() },
        state: {
          status: "completed",
          title: "src/new-file.ts",
          input: {
            filePath: "src/new-file.ts",
            content: 'export const hello = "world";\n',
          },
          output: "ok",
        },
      });
    });

    // Shows Create label
    it("Create ラベルが表示されること", () => {
      expect(screen.getByText("Create")).toBeInTheDocument();
    });

    // Shows all-add diff lines when expanded
    it("展開すると全行が add の差分が表示されること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Toggle details"));
      const addLines = document.querySelectorAll(".tool-diff-line-add");
      expect(addLines.length).toBeGreaterThan(0);
    });
  });

  // "run" category tool (bash) shows command
  context("run カテゴリのツール（bash）を表示した場合", () => {
    beforeEach(async () => {
      await setupWithToolPart({
        id: "tp1",
        type: "tool",
        tool: "bash",
        messageID: "m1",
        time: { created: Date.now(), updated: Date.now() },
        state: {
          status: "completed",
          title: "npm test",
          input: { command: "npm test" },
          output: "All tests passed",
        },
      });
    });

    // Shows Run label
    it("Run ラベルが表示されること", () => {
      expect(screen.getByText("Run")).toBeInTheDocument();
    });

    // Shows command text
    it("コマンドが表示されること", () => {
      expect(screen.getByText("npm test")).toBeInTheDocument();
    });
  });

  // "search" category tool shows "Search" label
  it("search カテゴリのツールに Search ラベルが表示されること", async () => {
    await setupWithToolPart({
      id: "tp1",
      type: "tool",
      tool: "grep",
      messageID: "m1",
      time: { created: Date.now(), updated: Date.now() },
      state: {
        status: "completed",
        title: "pattern in src/",
        input: { pattern: "TODO", path: "src/" },
        output: "src/main.ts:10: // TODO: fix",
      },
    });

    expect(screen.getByText("Search")).toBeInTheDocument();
  });

  // Error state tool shows error message
  it("エラー状態のツールにエラーメッセージが表示されること", async () => {
    await setupWithToolPart({
      id: "tp1",
      type: "tool",
      tool: "bash",
      messageID: "m1",
      time: { created: Date.now(), updated: Date.now() },
      state: {
        status: "error",
        title: "npm build",
        input: { command: "npm build" },
        error: "Build failed: syntax error",
      },
    });

    // 展開してエラーメッセージを確認
    const user = userEvent.setup();
    await user.click(screen.getByTitle("Toggle details"));

    expect(screen.getByText("Build failed: syntax error")).toBeInTheDocument();
  });

  // Expand/collapse toggles details
  context("展開・折りたたみをトグルする場合", () => {
    beforeEach(async () => {
      await setupWithToolPart({
        id: "tp1",
        type: "tool",
        tool: "read",
        messageID: "m1",
        time: { created: Date.now(), updated: Date.now() },
        state: {
          status: "completed",
          title: "src/main.ts",
          input: { filePath: "src/main.ts" },
          output: "file content here",
        },
      });
    });

    // Initially collapsed
    it("初期状態では折りたたまれていること", () => {
      expect(screen.queryByText("file content here")).not.toBeInTheDocument();
    });

    // Expands on click
    context("展開した場合", () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.click(screen.getByTitle("Toggle details"));
      });

      // Shows content
      it("コンテンツが表示されること", () => {
        expect(screen.getByText("file content here")).toBeInTheDocument();
      });

      // Collapses on second click
      context("再クリックした場合", () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.click(screen.getByTitle("Toggle details"));
        });

        // Hides content
        it("コンテンツが非表示になること", () => {
          expect(screen.queryByText("file content here")).not.toBeInTheDocument();
        });
      });
    });
  });

  // Running state shows spinner
  it("running 状態ではスピナーが表示されること", async () => {
    await setupWithToolPart({
      id: "tp1",
      type: "tool",
      tool: "bash",
      messageID: "m1",
      time: { created: Date.now(), updated: Date.now() },
      state: {
        status: "running",
        title: "npm install",
        input: { command: "npm install" },
      },
    });

    // スピナー SVG が存在する
    const spinner = document.querySelector(".tool-part-spinner");
    expect(spinner).toBeTruthy();
  });

  // "other" category tool shows "Tool" label
  it("other カテゴリのツールに Tool ラベルが表示されること", async () => {
    await setupWithToolPart({
      id: "tp1",
      type: "tool",
      tool: "question",
      messageID: "m1",
      time: { created: Date.now(), updated: Date.now() },
      state: {
        status: "completed",
        title: "What should I do?",
        input: { question: "What?" },
        output: "answered",
      },
    });

    expect(screen.getByText("Tool")).toBeInTheDocument();
  });

  // MCP tool name resolves to correct category
  it("MCP ツール名がカテゴリに正しく解決されること", async () => {
    await setupWithToolPart({
      id: "tp1",
      type: "tool",
      tool: "mcp_server/read",
      messageID: "m1",
      time: { created: Date.now(), updated: Date.now() },
      state: {
        status: "completed",
        title: "remote file",
        input: { path: "/remote/file" },
        output: "content",
      },
    });

    // mcp_server/read → read カテゴリ → "Read" ラベル
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  // Pending state shows spinner
  it("pending 状態でスピナーが表示されること", async () => {
    await setupWithToolPart({
      id: "tp1",
      type: "tool",
      tool: "read",
      messageID: "m1",
      time: { created: Date.now(), updated: Date.now() },
      state: {
        status: "pending",
      },
    });

    const spinner = document.querySelector(".tool-part-spinner");
    expect(spinner).toBeTruthy();
  });

  // todowrite tool shows TodoView with count label when expanded
  context("todowrite ツールを表示した場合", () => {
    beforeEach(async () => {
      const todos = [
        { content: "Task 1", status: "completed" },
        { content: "Task 2", status: "pending" },
      ];
      await setupWithToolPart({
        id: "tp1",
        type: "tool",
        tool: "todowrite",
        messageID: "m1",
        time: { created: Date.now(), updated: Date.now() },
        state: {
          status: "completed",
          title: "todowrite",
          input: { todos },
          output: JSON.stringify(todos),
        },
      });
    });

    // Shows count label
    it("件数ラベルが表示されること", () => {
      expect(screen.getByText("1/2 todos")).toBeInTheDocument();
    });

    // Shows todo items when expanded
    context("展開した場合", () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.click(screen.getByTitle("Toggle details"));
      });

      // Shows first task
      it("Task 1 が表示されること", () => {
        expect(screen.getByText("Task 1")).toBeInTheDocument();
      });

      // Shows second task
      it("Task 2 が表示されること", () => {
        expect(screen.getByText("Task 2")).toBeInTheDocument();
      });
    });
  });
});
