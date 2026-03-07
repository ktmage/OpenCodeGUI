import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createMessage, createSession, createTextPart } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** ユーザー→アシスタントの 2 メッセージ構成をセットアップする */
async function setupWithMessages() {
  renderApp();
  const session = createSession({ id: "s1", title: "Undo Test" });
  await sendExtMessage({ type: "activeSession", session });

  const userMsg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
  const userPart = createTextPart("Hello", { messageID: "m1" });
  const assistantMsg = createMessage({ id: "m2", sessionID: "s1", role: "assistant" });
  const assistantPart = createTextPart("Hi there", { messageID: "m2" });

  await sendExtMessage({
    type: "messages",
    sessionId: "s1",
    messages: [
      { info: userMsg, parts: [userPart] },
      { info: assistantMsg, parts: [assistantPart] },
    ],
  });

  vi.mocked(postMessage).mockClear();
  return session;
}

/** ユーザー→アシスタント→ユーザーの 3 メッセージ構成をセットアップする */
async function setupWithThreeMessages() {
  renderApp();
  const session = createSession({ id: "s1", title: "Undo Test" });
  await sendExtMessage({ type: "activeSession", session });

  const userMsg1 = createMessage({ id: "m1", sessionID: "s1", role: "user" });
  const userPart1 = createTextPart("First question", { messageID: "m1" });
  const assistantMsg = createMessage({ id: "m2", sessionID: "s1", role: "assistant" });
  const assistantPart = createTextPart("First answer", { messageID: "m2" });
  const userMsg2 = createMessage({ id: "m3", sessionID: "s1", role: "user" });
  const userPart2 = createTextPart("Second question", { messageID: "m3" });

  await sendExtMessage({
    type: "messages",
    sessionId: "s1",
    messages: [
      { info: userMsg1, parts: [userPart1] },
      { info: assistantMsg, parts: [assistantPart] },
      { info: userMsg2, parts: [userPart2] },
    ],
  });

  vi.mocked(postMessage).mockClear();
  return session;
}

// Undo/Redo UI
describe("Undo/Redo", () => {
  // Undo button is enabled when there are multiple messages
  context("メッセージが 2 つ以上ある場合", () => {
    beforeEach(async () => {
      await setupWithMessages();
    });

    // undo button is enabled
    it("Undo ボタンが有効になること", () => {
      const undoBtn = screen.getByTitle("Undo") as HTMLButtonElement;
      expect(undoBtn.disabled).toBe(false);
    });
  });

  // Redo button is disabled when session has no revert field
  context("Undo 未実行の場合", () => {
    beforeEach(async () => {
      await setupWithMessages();
    });

    // redo button is disabled
    it("Redo ボタンが disabled であること", () => {
      const redoBtn = screen.getByTitle("Redo") as HTMLButtonElement;
      expect(redoBtn.disabled).toBe(true);
    });
  });

  // Clicking undo sends undoSession message
  context("Undo ボタンをクリックした場合", () => {
    beforeEach(async () => {
      await setupWithMessages();
    });

    // sends undoSession message with last assistant message id
    it("最後のアシスタントメッセージ ID で undoSession メッセージを送信すること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Undo"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "undoSession",
        sessionId: "s1",
        messageId: "m2",
      });
    });
  });

  // Undo prefills the input with the user message text
  context("Undo でユーザーメッセージが巻き戻される場合", () => {
    // prefills the input with the user text that was above the assistant message
    it("入力欄にユーザーメッセージのテキストがプリフィルされること", async () => {
      await setupWithThreeMessages();
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Undo"));
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      expect(textarea).toHaveValue("Second question");
    });
  });

  // Undo with only user+assistant prefills user text
  context("ユーザー＋アシスタントの 2 メッセージで Undo した場合", () => {
    // prefills the input with the user's message text
    it("入力欄にユーザーメッセージのテキストがプリフィルされること", async () => {
      await setupWithMessages();
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Undo"));
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      expect(textarea).toHaveValue("Hello");
    });
  });

  // Redo button is enabled after undo (session.revert is set)
  context("Undo 実行後の場合", () => {
    // redo button is enabled when session has revert
    it("Redo ボタンが有効になること", async () => {
      renderApp();
      const session = createSession({
        id: "s1",
        title: "Undo Test",
        revert: { messageID: "m2" },
      });
      await sendExtMessage({ type: "activeSession", session });

      const redoBtn = screen.getByTitle("Redo") as HTMLButtonElement;
      expect(redoBtn.disabled).toBe(false);
    });
  });

  // Clicking redo sends redoSession message
  context("Redo ボタンをクリックした場合", () => {
    // sends redoSession message
    it("redoSession メッセージを送信すること", async () => {
      renderApp();
      const session = createSession({
        id: "s1",
        title: "Redo Test",
        revert: { messageID: "m2" },
      });
      await sendExtMessage({ type: "activeSession", session });
      vi.mocked(postMessage).mockClear();

      const user = userEvent.setup();
      await user.click(screen.getByTitle("Redo"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "redoSession",
        sessionId: "s1",
      });
    });
  });

  // Redo clears the prefill text
  context("Undo 後に Redo した場合", () => {
    // sends redoSession after undo
    it("undoSession の後に redoSession を送信できること", async () => {
      await setupWithThreeMessages();
      const user = userEvent.setup();

      // Undo
      await user.click(screen.getByTitle("Undo"));

      // session.revert を設定して Redo ボタンを有効にする
      const sessionWithRevert = createSession({
        id: "s1",
        title: "Undo Test",
        revert: { messageID: "m2" },
      });
      await sendExtMessage({ type: "activeSession", session: sessionWithRevert });
      vi.mocked(postMessage).mockClear();

      // Redo
      await user.click(screen.getByTitle("Redo"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "redoSession",
        sessionId: "s1",
      });
    });
  });

  // Undo/Redo buttons disabled when session is busy
  context("セッションがビジーの場合", () => {
    // undo button is disabled
    it("Undo ボタンが disabled であること", async () => {
      renderApp();
      const session = createSession({ id: "s1", title: "Busy Test" });
      await sendExtMessage({ type: "activeSession", session });

      const userMsg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
      const userPart = createTextPart("Hello", { messageID: "m1" });
      const assistantMsg = createMessage({ id: "m2", sessionID: "s1", role: "assistant" });
      const assistantPart = createTextPart("Hi", { messageID: "m2" });

      await sendExtMessage({
        type: "messages",
        sessionId: "s1",
        messages: [
          { info: userMsg, parts: [userPart] },
          { info: assistantMsg, parts: [assistantPart] },
        ],
      });

      // ビジー状態にする: session.status イベントで busy を通知
      await sendExtMessage({
        type: "event",
        event: { type: "session.status", properties: { status: { type: "busy" } } } as any,
      });

      const undoBtn = screen.getByTitle("Undo") as HTMLButtonElement;
      expect(undoBtn.disabled).toBe(true);
    });
  });

  // No active session → no undo/redo buttons
  context("アクティブセッションがない場合", () => {
    // does not show undo/redo buttons
    it("Undo/Redo ボタンが表示されないこと", () => {
      renderApp();
      expect(screen.queryByTitle("Undo")).not.toBeInTheDocument();
    });
  });
});
