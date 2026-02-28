import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import {
  createMessage,
  createSession,
  createSubtaskPart,
  createTaskToolPart,
  createTextPart,
} from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** 親セッション + subtask パート + 子セッションをセットアップする */
async function setupParentWithSubtask() {
  renderApp();
  const parentSession = createSession({ id: "parent-1", title: "Parent Chat" });
  await sendExtMessage({ type: "activeSession", session: parentSession });

  const assistantMsg = createMessage({ id: "m1", sessionID: "parent-1", role: "assistant" });
  const textPart = createTextPart("Let me delegate this.", { messageID: "m1" });
  const subtaskPart = createSubtaskPart("coder", "Fix the bug", { messageID: "m1" });

  await sendExtMessage({
    type: "messages",
    sessionId: "parent-1",
    messages: [{ info: assistantMsg, parts: [textPart, subtaskPart as any] }],
  });

  const childSession = createSession({ id: "child-1", title: "Fix the bug", parentID: "parent-1" });
  await sendExtMessage({ type: "childSessions", sessionId: "parent-1", children: [childSession] });

  vi.mocked(postMessage).mockClear();
  return { parentSession, childSession };
}

// Child session navigation
describe("子セッションナビゲーション", () => {
  // Subtask part display in parent session
  context("親セッションに subtask パートがある場合", () => {
    beforeEach(async () => {
      await setupParentWithSubtask();
    });

    // displays the Agent label
    it("Agent ラベルが表示されること", () => {
      expect(screen.getByText("Agent")).toBeInTheDocument();
    });

    // displays the agent name and description
    it("エージェント名と説明が表示されること", () => {
      expect(screen.getByText("coder: Fix the bug")).toBeInTheDocument();
    });
  });

  // Clicking subtask to navigate to child session
  context("subtask パートをクリックした場合", () => {
    beforeEach(async () => {
      await setupParentWithSubtask();
    });

    // sends selectSession message for child session
    it("子セッションの selectSession メッセージを送信すること", async () => {
      const user = userEvent.setup();
      const header = document.querySelector(".header:last-of-type") as HTMLElement;
      await user.click(header);
      expect(postMessage).toHaveBeenCalledWith({
        type: "selectSession",
        sessionId: "child-1",
      });
    });
  });

  // Child session shows back button instead of session list toggle
  context("子セッションを表示した場合", () => {
    beforeEach(async () => {
      renderApp();
      const childSession = createSession({ id: "child-1", title: "Fix the bug", parentID: "parent-1" });
      await sendExtMessage({ type: "activeSession", session: childSession });
    });

    // shows back button
    it("戻るボタンが表示されること", () => {
      expect(screen.getByTitle("Back to parent session")).toBeInTheDocument();
    });

    // does not show new chat button
    it("新規チャットボタンが表示されないこと", () => {
      expect(screen.queryByTitle("New chat")).not.toBeInTheDocument();
    });

    // hides the input area
    it("入力エリアが非表示になること", () => {
      expect(screen.queryByPlaceholderText("Ask anything...")).not.toBeInTheDocument();
    });
  });

  // Clicking back button navigates to parent
  context("戻るボタンをクリックした場合", () => {
    beforeEach(async () => {
      renderApp();
      const childSession = createSession({ id: "child-1", title: "Fix the bug", parentID: "parent-1" });
      await sendExtMessage({ type: "activeSession", session: childSession });
      vi.mocked(postMessage).mockClear();
    });

    // sends selectSession message for parent session
    it("親セッションの selectSession メッセージを送信すること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Back to parent session"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "selectSession",
        sessionId: "parent-1",
      });
    });
  });

  // Parent session does not show back button
  context("親セッションの場合", () => {
    beforeEach(async () => {
      renderApp();
      const parentSession = createSession({ id: "parent-1", title: "Parent Chat" });
      await sendExtMessage({ type: "activeSession", session: parentSession });
    });

    // does not show back button
    it("戻るボタンが表示されないこと", () => {
      expect(screen.queryByTitle("Back to parent session")).not.toBeInTheDocument();
    });

    // shows new chat button
    it("新規チャットボタンが表示されること", () => {
      expect(screen.getByTitle("New chat")).toBeInTheDocument();
    });
  });

  // task tool part rendered as subtask
  context("task ツール呼び出しがメッセージに含まれる場合", () => {
    beforeEach(async () => {
      renderApp();
      const parentSession = createSession({ id: "parent-2", title: "Parent Chat 2" });
      await sendExtMessage({ type: "activeSession", session: parentSession });

      const assistantMsg = createMessage({ id: "m2", sessionID: "parent-2", role: "assistant" });
      const textPart = createTextPart("Delegating to subagent.", { messageID: "m2" });
      const taskToolPart = createTaskToolPart("general", "Search for utils", { messageID: "m2" });

      await sendExtMessage({
        type: "messages",
        sessionId: "parent-2",
        messages: [{ info: assistantMsg, parts: [textPart, taskToolPart as any] }],
      });

      const childSession = createSession({ id: "child-task-1", title: "Search for utils", parentID: "parent-2" });
      await sendExtMessage({ type: "childSessions", sessionId: "parent-2", children: [childSession] });
      vi.mocked(postMessage).mockClear();
    });

    // displays Agent label (not Run label)
    it("Agent ラベルが表示されること（Run ではなく）", () => {
      const agentLabels = screen.getAllByText("Agent");
      expect(agentLabels.length).toBeGreaterThan(0);
    });

    // displays agent name and description from state.input
    it("エージェント名と説明が state.input から表示されること", () => {
      expect(screen.getByText("general: Search for utils")).toBeInTheDocument();
    });

    // navigates to child session on click
    it("クリックで子セッションにナビゲートすること", async () => {
      const user = userEvent.setup();
      // Find the subtask header showing "general: Search for utils"
      const title = screen.getByText("general: Search for utils");
      const header = title.closest(".header") as HTMLElement;
      await user.click(header);
      expect(postMessage).toHaveBeenCalledWith({
        type: "selectSession",
        sessionId: "child-task-1",
      });
    });
  });
});
