import { describe, it, expect, vi } from "vitest";
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

describe("10 ツール表示", () => {
  it("read カテゴリのツールに Read ラベルが表示される", async () => {
    await setupWithToolPart({
      id: "tp1",
      type: "tool",
      tool: "read",
      messageID: "m1",
      time: { created: Date.now(), updated: Date.now() },
      state: { status: "completed", title: "src/main.ts", input: { filePath: "src/main.ts" }, output: "file content" },
    });

    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(screen.getByText("src/main.ts")).toBeInTheDocument();
  });

  it("edit カテゴリのツールで差分ビューが展開時に表示される", async () => {
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

    expect(screen.getByText("Edit")).toBeInTheDocument();

    // 展開して差分を確認
    const user = userEvent.setup();
    await user.click(screen.getByTitle("Toggle details"));

    // 差分ビューが表示される（add/remove 行）
    const diffLines = document.querySelectorAll(".tool-diff-line");
    expect(diffLines.length).toBeGreaterThan(0);
  });

  it("write カテゴリのツールでファイル作成ビューが表示される", async () => {
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

    expect(screen.getByText("Create")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Toggle details"));

    // ファイル作成ビュー（全行が add）
    const addLines = document.querySelectorAll(".tool-diff-line-add");
    expect(addLines.length).toBeGreaterThan(0);
  });

  it("run カテゴリのツール（bash）にコマンド表示", async () => {
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

    expect(screen.getByText("Run")).toBeInTheDocument();
    expect(screen.getByText("npm test")).toBeInTheDocument();
  });

  it("search カテゴリのツールに Search ラベルが表示される", async () => {
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

  it("エラー状態のツールにエラーメッセージが表示される", async () => {
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

  it("展開・折りたたみが切り替わる", async () => {
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

    const user = userEvent.setup();
    const header = screen.getByTitle("Toggle details");

    // 初期状態は折りたたみ
    expect(screen.queryByText("file content here")).not.toBeInTheDocument();

    // 展開
    await user.click(header);
    expect(screen.getByText("file content here")).toBeInTheDocument();

    // 折りたたみ
    await user.click(header);
    expect(screen.queryByText("file content here")).not.toBeInTheDocument();
  });

  it("running 状態ではスピナーが表示される", async () => {
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

  it("other カテゴリのツールに Tool ラベルが表示される", async () => {
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

  it("MCP ツール名がカテゴリに正しく解決される", async () => {
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

  it("pending 状態でスピナーが表示される", async () => {
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

  it("todowrite ツール展開時に TodoView が件数ラベル付きで表示される", async () => {
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

    // タイトルに件数が表示される
    expect(screen.getByText("1/2 todos")).toBeInTheDocument();

    // 展開して TodoView を確認
    const user = userEvent.setup();
    await user.click(screen.getByTitle("Toggle details"));
    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
  });
});
