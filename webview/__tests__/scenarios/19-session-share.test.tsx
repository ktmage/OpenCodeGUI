import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createMessage, createSession, createTextPart } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/**
 * メッセージが存在するセッションをセットアップするヘルパー。
 * 空セッションでは共有ボタンが表示されないため、必ずメッセージを送信する。
 */
async function setupSessionWithMessages(sessionOverrides: Partial<Parameters<typeof createSession>[0]> = {}) {
  const session = createSession({ id: "s1", title: "Chat", ...sessionOverrides });
  await sendExtMessage({ type: "activeSession", session });
  const msg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
  const part = createTextPart("hello", { messageID: "m1" });
  await sendExtMessage({ type: "messages", sessionId: "s1", messages: [{ info: msg, parts: [part] }] });
  return session;
}

// Session share
describe("セッション共有", () => {
  // when session is active (not shared)
  context("未共有のアクティブセッションがある場合", () => {
    beforeEach(async () => {
      renderApp();
      await setupSessionWithMessages();
      vi.mocked(postMessage).mockClear();
    });

    // shows share button
    it("共有ボタンが表示されること", () => {
      expect(screen.getByTitle("Share session")).toBeInTheDocument();
    });

    // sends shareSession message when clicked
    it("共有ボタンクリック時に shareSession メッセージを送信すること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Share session"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "shareSession",
        sessionId: "s1",
      });
    });
  });

  // when session becomes shared
  context("セッションが共有状態になった場合", () => {
    beforeEach(async () => {
      renderApp();
      await setupSessionWithMessages({ share: { url: "https://share.example.com/abc" } });
      vi.mocked(postMessage).mockClear();
    });

    // shows unshare button
    it("共有解除ボタンが表示されること", () => {
      expect(screen.getByTitle("Unshare session")).toBeInTheDocument();
    });

    // share button is not visible
    it("共有ボタンが表示されないこと", () => {
      expect(screen.queryByTitle("Share session")).not.toBeInTheDocument();
    });

    // sends unshareSession message when clicked
    it("共有解除ボタンクリック時に unshareSession メッセージを送信すること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Unshare session"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "unshareSession",
        sessionId: "s1",
      });
    });
  });

  // share → unshare flow
  context("共有して共有解除するフローの場合", () => {
    // share state toggles correctly
    it("共有状態が正しく切り替わること", async () => {
      renderApp();

      // 1. メッセージ付きの未共有セッションを設定
      await setupSessionWithMessages();
      expect(screen.getByTitle("Share session")).toBeInTheDocument();

      // 2. 共有状態のセッションに更新
      const sharedSession = createSession({
        id: "s1",
        title: "Chat",
        share: { url: "https://share.example.com/abc" },
      });
      await sendExtMessage({ type: "activeSession", session: sharedSession });
      expect(screen.getByTitle("Unshare session")).toBeInTheDocument();

      // 3. 共有解除されたセッションに更新
      const unsharedSession = createSession({ id: "s1", title: "Chat" });
      await sendExtMessage({ type: "activeSession", session: unsharedSession });
      expect(screen.getByTitle("Share session")).toBeInTheDocument();
    });
  });

  // when no active session
  context("アクティブセッションがない場合", () => {
    // does not show share button
    it("共有ボタンが表示されないこと", () => {
      renderApp();
      expect(screen.queryByTitle("Share session")).not.toBeInTheDocument();
    });
  });

  // when session has no messages (empty session)
  context("メッセージのない空セッションの場合", () => {
    // does not show share button
    it("共有ボタンが表示されないこと", async () => {
      renderApp();
      const session = createSession({ id: "s1", title: "Chat" });
      await sendExtMessage({ type: "activeSession", session });
      expect(screen.queryByTitle("Share session")).not.toBeInTheDocument();
    });
  });
});
