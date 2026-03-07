import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { createEvent, createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** session.todo() API 経由で Todo 付きのセッションをセットアップする */
async function setupWithTodos(todos: Array<{ id: string; content: string; status: string; priority: string }>) {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
  await sendExtMessage({ type: "sessionTodos", sessionId: "s1", todos });
}

// Todo
describe("Todo", () => {
  // TodoHeader is shown from session.todo() API
  context("session.todo() API から TodoHeader を表示した場合", () => {
    beforeEach(async () => {
      await setupWithTodos([
        { id: "t1", content: "First task", status: "completed", priority: "medium" },
        { id: "t2", content: "Second task", status: "in_progress", priority: "medium" },
        { id: "t3", content: "Third task", status: "pending", priority: "low" },
      ]);
    });

    // Shows count
    it("カウントが表示されること", () => {
      expect(screen.getByText("1/3")).toBeInTheDocument();
    });

    // Shows To Do label
    it("To Do ラベルが表示されること", () => {
      expect(screen.getByText("To Do")).toBeInTheDocument();
    });
  });

  // Expanding shows the todo list contents
  context("Todo 一覧を展開した場合", () => {
    beforeEach(async () => {
      await setupWithTodos([
        { id: "t1", content: "Implement feature", status: "completed", priority: "medium" },
        { id: "t2", content: "Write tests", status: "in_progress", priority: "high" },
      ]);

      const user = userEvent.setup();
      await user.click(screen.getByTitle("Toggle to-do list"));
    });

    // Shows first todo
    it("最初の Todo が表示されること", () => {
      expect(screen.getByText("Implement feature")).toBeInTheDocument();
    });

    // Shows second todo
    it("2番目の Todo が表示されること", () => {
      expect(screen.getByText("Write tests")).toBeInTheDocument();
    });

    // Shows priority label
    it("優先度ラベルが表示されること", () => {
      expect(screen.getByText("high")).toBeInTheDocument();
    });
  });

  // TodoHeader is hidden when there are no todos
  it("Todo がない場合は TodoHeader が非表示になること", async () => {
    renderApp();
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

    // Todo なし → TodoHeader なし
    expect(screen.queryByText("To Do")).not.toBeInTheDocument();
  });

  // todo.updated SSE event updates TodoHeader in real-time
  it("todo.updated SSE イベントで TodoHeader がリアルタイム更新されること", async () => {
    renderApp();
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

    // todo.updated イベントで Todo を受信
    await sendExtMessage({
      type: "event",
      event: createEvent("todo.updated", {
        sessionID: "s1",
        todos: [
          { id: "t1", content: "SSE task 1", status: "completed", priority: "medium" },
          { id: "t2", content: "SSE task 2", status: "pending", priority: "low" },
        ],
      }),
    });

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  // Count matches when all todos are completed
  it("全て完了のとき件数が一致すること", async () => {
    await setupWithTodos([
      { id: "t1", content: "Task A", status: "completed", priority: "medium" },
      { id: "t2", content: "Task B", status: "completed", priority: "low" },
    ]);

    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  // Todos are cleared when switching to a session without todos
  it("セッション切替で Todo がクリアされること", async () => {
    await setupWithTodos([{ id: "t1", content: "Some task", status: "pending", priority: "medium" }]);
    expect(screen.getByText("To Do")).toBeInTheDocument();

    // 別のセッション（Todo なし）に切替
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s2" }) });
    // 新セッションの sessionTodos 応答（空）でクリアされる
    await sendExtMessage({ type: "sessionTodos", sessionId: "s2", todos: [] });

    expect(screen.queryByText("To Do")).not.toBeInTheDocument();
  });

  // todo.updated for a different session is ignored
  it("別セッションの todo.updated イベントは無視されること", async () => {
    renderApp();
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

    // 別セッション (s999) の todo.updated
    await sendExtMessage({
      type: "event",
      event: createEvent("todo.updated", {
        sessionID: "s999",
        todos: [{ id: "t1", content: "Other session task", status: "pending", priority: "medium" }],
      }),
    });

    expect(screen.queryByText("To Do")).not.toBeInTheDocument();
  });

  // Todos are preserved when activeSession message is re-sent for the same session
  it("同じセッションの activeSession 再送で Todo がクリアされないこと", async () => {
    await setupWithTodos([{ id: "t1", content: "Persistent task", status: "pending", priority: "medium" }]);
    expect(screen.getByText("To Do")).toBeInTheDocument();

    // 同じセッション s1 の activeSession が再送される（session.updated 等で発生しうる）
    await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

    // Todo はクリアされず維持される
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("0/1")).toBeInTheDocument();
  });
});
