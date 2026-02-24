import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createMessage, createSession, createTextPart } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/**
 * セッションを持つ初期状態をセットアップするヘルパー。
 * sessions メッセージを送信してセッションリストを設定する。
 */
async function setupWithSessions(sessions: ReturnType<typeof createSession>[]) {
  renderApp();
  await sendExtMessage({ type: "sessions", sessions });
}

// Session lifecycle
describe("セッションライフサイクル", () => {
  // No sessions → EmptyState
  context("セッションなしの場合", () => {
    beforeEach(() => {
      renderApp();
    });

    // Shows getting started message
    it("開始メッセージが表示されること", () => {
      expect(screen.getByText("Start a new conversation to get started.")).toBeInTheDocument();
    });

    // Shows New Chat button
    it("New Chat ボタンが表示されること", () => {
      expect(screen.getByText("New Chat")).toBeInTheDocument();
    });
  });

  // New Chat button in EmptyState sends createSession
  it("EmptyState の New Chat ボタンで createSession が送信されること", async () => {
    renderApp();
    const user = userEvent.setup();

    await user.click(screen.getByText("New Chat"));

    expect(postMessage).toHaveBeenCalledWith({ type: "createSession" });
  });

  // activeSession message shows InputArea
  it("activeSession メッセージで InputArea が表示されること", async () => {
    renderApp();

    await sendExtMessage({ type: "activeSession", session: createSession({ title: "Test Session" }) });

    expect(screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)")).toBeInTheDocument();
  });

  // Automatically sends getMessages on activeSession
  it("activeSession 受信時に getMessages が自動送信されること", async () => {
    renderApp();
    vi.mocked(postMessage).mockClear();

    const session = createSession();
    await sendExtMessage({ type: "activeSession", session });

    expect(postMessage).toHaveBeenCalledWith({ type: "getMessages", sessionId: session.id });
  });

  // Displays session title in the header
  it("ヘッダーにセッションタイトルが表示されること", async () => {
    renderApp();

    await sendExtMessage({ type: "activeSession", session: createSession({ title: "My Conversation" }) });

    expect(screen.getByText("My Conversation")).toBeInTheDocument();
  });

  // Opens and closes session list
  context("セッションリストを開閉する場合", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(async () => {
      const sessions = [createSession({ title: "Session A" }), createSession({ title: "Session B" })];
      await setupWithSessions(sessions);
      user = userEvent.setup();
    });

    // Initially the list is hidden
    it("初期状態ではリストは非表示こと", () => {
      expect(screen.queryByText("Session A")).not.toBeInTheDocument();
    });

    // After clicking toggle button
    context("トグルボタンをクリックした場合", () => {
      beforeEach(async () => {
        await user.click(screen.getByTitle("Sessions"));
      });

      // Session A is displayed
      it("Session A が表示されること", () => {
        expect(screen.getByText("Session A")).toBeInTheDocument();
      });

      // Session B is displayed
      it("Session B が表示されること", () => {
        expect(screen.getByText("Session B")).toBeInTheDocument();
      });

      // After clicking toggle again
      context("もう一度クリックした場合", () => {
        beforeEach(async () => {
          await user.click(screen.getByTitle("Sessions"));
        });

        // List closes
        it("リストが閉じること", () => {
          expect(screen.queryByText("Session A")).not.toBeInTheDocument();
        });
      });
    });
  });

  // Selecting a session sends selectSession and closes the list
  context("セッションを選択した場合", () => {
    let session: ReturnType<typeof createSession>;

    beforeEach(async () => {
      session = createSession({ title: "Target Session" });
      await setupWithSessions([session]);
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Sessions"));
      vi.mocked(postMessage).mockClear();
      await user.click(screen.getByText("Target Session"));
    });

    // Sends selectSession
    it("selectSession が送信されること", () => {
      expect(postMessage).toHaveBeenCalledWith({ type: "selectSession", sessionId: session.id });
    });

    // Closes the session list
    it("リストが閉じること", () => {
      expect(screen.queryByText("Target Session")).not.toBeInTheDocument();
    });
  });

  // Deleting a session sends deleteSession
  it("セッション削除で deleteSession が送信されること", async () => {
    const session = createSession({ title: "To Delete" });
    await setupWithSessions([session]);

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Sessions"));
    vi.mocked(postMessage).mockClear();

    await user.click(screen.getByTitle("Delete"));

    expect(postMessage).toHaveBeenCalledWith({ type: "deleteSession", sessionId: session.id });
  });

  // session.created event adds a new session
  context("session.created イベントを受信した場合", () => {
    beforeEach(async () => {
      renderApp();
      const existingSession = createSession({ title: "Existing" });
      await sendExtMessage({ type: "sessions", sessions: [existingSession] });

      const newSession = createSession({ title: "New Session" });
      await sendExtMessage({
        type: "event",
        event: { type: "session.created", properties: { info: newSession } } as any,
      });

      const user = userEvent.setup();
      await user.click(screen.getByTitle("Sessions"));
    });

    // New session is displayed
    it("新しいセッションが表示されること", () => {
      expect(screen.getByText("New Session")).toBeInTheDocument();
    });

    // Existing session remains
    it("既存のセッションも表示されること", () => {
      expect(screen.getByText("Existing")).toBeInTheDocument();
    });
  });

  // session.deleted event removes the session
  context("session.deleted イベントを受信した場合", () => {
    beforeEach(async () => {
      const session = createSession({ title: "Will Be Deleted" });
      await setupWithSessions([session]);

      await sendExtMessage({
        type: "event",
        event: { type: "session.deleted", properties: { info: session } } as any,
      });

      const user = userEvent.setup();
      await user.click(screen.getByTitle("Sessions"));
    });

    // Deleted session is removed
    it("削除されたセッションが表示されないこと", () => {
      expect(screen.queryByText("Will Be Deleted")).not.toBeInTheDocument();
    });

    // Shows empty state
    it("No sessions が表示されること", () => {
      expect(screen.getByText("No sessions")).toBeInTheDocument();
    });
  });

  // session.updated event updates the title
  context("session.updated イベントでタイトルが更新された場合", () => {
    beforeEach(async () => {
      const session = createSession({ title: "Original Title" });
      renderApp();
      await sendExtMessage({ type: "sessions", sessions: [session] });
      await sendExtMessage({ type: "activeSession", session });

      // Precondition: original title is shown
      expect(screen.getByText("Original Title")).toBeInTheDocument();

      await sendExtMessage({
        type: "event",
        event: { type: "session.updated", properties: { info: { ...session, title: "Updated Title" } } } as any,
      });
    });

    // Title is updated
    it("タイトルが更新されること", () => {
      expect(screen.getByText("Updated Title")).toBeInTheDocument();
    });
  });

  // Setting activeSession to null returns to EmptyState and clears messages
  context("activeSession を null に設定した場合", () => {
    beforeEach(async () => {
      renderApp();
      const session = createSession({ id: "s1", title: "Active" });
      await sendExtMessage({ type: "activeSession", session });

      const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
      const part = createTextPart("Some response", { messageID: "m1" });
      await sendExtMessage({
        type: "messages",
        sessionId: "s1",
        messages: [{ info: msg, parts: [part] }],
      });

      // Precondition: message is displayed
      expect(screen.getByText("Some response")).toBeInTheDocument();

      await sendExtMessage({ type: "activeSession", session: null });
    });

    // Returns to EmptyState
    it("EmptyState に戻ること", () => {
      expect(screen.getByText("New Chat")).toBeInTheDocument();
    });

    // Messages are cleared
    it("メッセージがクリアされること", () => {
      expect(screen.queryByText("Some response")).not.toBeInTheDocument();
    });
  });

  // session.updated updates title in both header and session list
  context("session.updated でアクティブセッションのタイトルが更新された場合", () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(async () => {
      const session = createSession({ id: "s1", title: "Before Update" });
      renderApp();
      await sendExtMessage({ type: "sessions", sessions: [session] });
      await sendExtMessage({ type: "activeSession", session });

      // Precondition: original title is shown in header
      expect(screen.getByText("Before Update")).toBeInTheDocument();

      await sendExtMessage({
        type: "event",
        event: { type: "session.updated", properties: { info: { ...session, title: "After Update" } } } as any,
      });

      user = userEvent.setup();
    });

    // Header is updated
    it("ヘッダーが更新されること", () => {
      expect(screen.getByText("After Update")).toBeInTheDocument();
    });

    // Session list is also updated
    it("セッション一覧でも更新されること", async () => {
      await user.click(screen.getByTitle("Sessions"));

      expect(screen.getAllByText("After Update").length).toBeGreaterThanOrEqual(1);
    });
  });

  // Shows "No sessions" when session list is empty
  it("セッション一覧の空状態で No sessions が表示されること", async () => {
    await setupWithSessions([]);

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Sessions"));

    expect(screen.getByText("No sessions")).toBeInTheDocument();
  });

  // Displays session summary (files/additions/deletions)
  context("セッションのサマリーを表示する場合", () => {
    beforeEach(async () => {
      const session = createSession({
        title: "With Summary",
        summary: { files: 3, additions: 42, deletions: 7 },
      } as any);
      await setupWithSessions([session]);

      const user = userEvent.setup();
      await user.click(screen.getByTitle("Sessions"));
    });

    // Shows file count
    it("ファイル数が表示されること", () => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    // Shows additions
    it("追加行数が表示されること", () => {
      expect(screen.getByText("+42")).toBeInTheDocument();
    });

    // Shows deletions
    it("削除行数が表示されること", () => {
      expect(screen.getByText("-7")).toBeInTheDocument();
    });
  });
});
