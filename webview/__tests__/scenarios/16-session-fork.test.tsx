import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createMessage, createSession, createTextPart } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** ユーザー→アシスタント→ユーザーの 3 メッセージ構成をセットアップする */
async function setupConversation() {
  renderApp();
  const session = createSession({ id: "s1", title: "Chat" });
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

// Session fork from checkpoint
describe("セッション Fork", () => {
  beforeEach(async () => {
    await setupConversation();
  });

  // Fork button is displayed on checkpoint divider
  context("チェックポイント区切り線の場合", () => {
    // shows fork button
    it("Fork ボタンが表示されること", () => {
      expect(screen.getByText("Fork from here")).toBeInTheDocument();
    });

    // shows retry button alongside fork button
    it("Retry ボタンも表示されること", () => {
      expect(screen.getByText("Retry from here")).toBeInTheDocument();
    });
  });

  // Clicking fork button sends forkSession message
  context("Fork ボタンをクリックした場合", () => {
    // sends forkSession message with sessionId and messageId
    it("forkSession メッセージを sessionId と messageId 付きで送信すること", async () => {
      const user = userEvent.setup();
      const forkButton = screen.getByText("Fork from here").closest("button")!;
      await user.click(forkButton);
      expect(postMessage).toHaveBeenCalledWith({
        type: "forkSession",
        sessionId: "s1",
        messageId: "m3",
      });
    });
  });

  // After fork, new session becomes active
  context("Fork 後に activeSession メッセージを受信した場合", () => {
    // switches to the forked session
    it("フォークされたセッションに切り替わること", async () => {
      const forkedSession = createSession({ id: "s-forked", title: "Forked Chat" });
      await sendExtMessage({ type: "activeSession", session: forkedSession });
      expect(screen.getByText("Forked Chat")).toBeInTheDocument();
    });
  });
});
