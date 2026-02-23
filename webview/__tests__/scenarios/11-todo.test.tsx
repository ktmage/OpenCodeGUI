import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createMessage } from "../factories";

/** todowrite ツール出力付きのセッションをセットアップする */
async function setupWithTodos(todos: Array<{ content: string; status: string; priority?: string }>) {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

  const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
  const todoPart = {
    id: "tp1",
    type: "tool" as const,
    tool: "todowrite",
    messageID: "m1",
    time: { created: Date.now(), updated: Date.now() },
    state: {
      status: "completed",
      title: "todowrite",
      input: { todos },
      output: JSON.stringify(todos),
    },
  };

  await sendExtMessage({
    type: "messages",
    sessionId: "s1",
    messages: [{ info: msg, parts: [todoPart as any] }],
  });
}

// 11 Todo
describe("11 Todo", () => {
  // TodoHeader is shown from todowrite output
  describe("todowrite 出力から TodoHeader 表示時", () => {
    beforeEach(async () => {
      await setupWithTodos([
        { content: "First task", status: "completed" },
        { content: "Second task", status: "in-progress" },
        { content: "Third task", status: "pending" },
      ]);
    });

    // Shows count
    it("カウントが表示される", () => {
      expect(screen.getByText("1/3")).toBeInTheDocument();
    });

    // Shows To Do label
    it("To Do ラベルが表示される", () => {
      expect(screen.getByText("To Do")).toBeInTheDocument();
    });
  });

  // Expanding shows the todo list contents
  describe("展開時の Todo 一覧", () => {
    beforeEach(async () => {
      await setupWithTodos([
        { content: "Implement feature", status: "completed" },
        { content: "Write tests", status: "in-progress", priority: "high" },
      ]);

      const user = userEvent.setup();
      await user.click(screen.getByTitle("Toggle to-do list"));
    });

    // Shows first todo
    it("最初の Todo が表示される", () => {
      expect(screen.getByText("Implement feature")).toBeInTheDocument();
    });

    // Shows second todo
    it("2番目の Todo が表示される", () => {
      expect(screen.getByText("Write tests")).toBeInTheDocument();
    });

    // Shows priority label
    it("優先度ラベルが表示される", () => {
      expect(screen.getByText("high")).toBeInTheDocument();
    });
  });

  // TodoHeader is hidden when there are no todos
  it("Todo がない場合は TodoHeader が非表示", async () => {
    renderApp();
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

    // メッセージなし → TodoHeader なし
    expect(screen.queryByText("To Do")).not.toBeInTheDocument();
  });

  // Todos are also shown from todoread tool output
  it("todoread ツールの出力からも Todo が表示される", async () => {
    renderApp();
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

    const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
    const todoPart = {
      id: "tp1",
      type: "tool" as const,
      tool: "todoread",
      messageID: "m1",
      time: { created: Date.now(), updated: Date.now() },
      state: {
        status: "completed",
        title: "todoread",
        input: {},
        output: JSON.stringify([
          { content: "Read task 1", status: "completed" },
          { content: "Read task 2", status: "pending" },
        ]),
      },
    };

    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [{ info: msg, parts: [todoPart as any] }],
    });

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  // Count matches when all todos are completed
  it("全て完了のとき件数が一致する", async () => {
    await setupWithTodos([
      { content: "Task A", status: "completed" },
      { content: "Task B", status: "done" },
    ]);

    expect(screen.getByText("2/2")).toBeInTheDocument();
  });
});
