import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createMessage, createTextPart } from "../factories";

/**
 * セッションを持つ初期状態をセットアップするヘルパー。
 * sessions メッセージを送信してセッションリストを設定する。
 */
async function setupWithSessions(sessions: ReturnType<typeof createSession>[]) {
  renderApp();
  await sendExtMessage({ type: "sessions", sessions });
}

describe("02 セッションライフサイクル", () => {
  it("セッションなし → EmptyState が表示される", () => {
    renderApp();

    expect(screen.getByText("Start a new conversation to get started.")).toBeInTheDocument();
    expect(screen.getByText("New Chat")).toBeInTheDocument();
  });

  it("EmptyState の New Chat ボタンで createSession が送信される", async () => {
    renderApp();
    const user = userEvent.setup();

    await user.click(screen.getByText("New Chat"));

    expect(postMessage).toHaveBeenCalledWith({ type: "createSession" });
  });

  it("activeSession メッセージで InputArea が表示される", async () => {
    renderApp();

    await sendExtMessage({ type: "activeSession", session: createSession({ title: "Test Session" }) });

    expect(screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)")).toBeInTheDocument();
  });

  it("activeSession 受信時に getMessages が自動送信される", async () => {
    renderApp();
    vi.mocked(postMessage).mockClear();

    const session = createSession();
    await sendExtMessage({ type: "activeSession", session });

    expect(postMessage).toHaveBeenCalledWith({ type: "getMessages", sessionId: session.id });
  });

  it("ヘッダーにセッションタイトルが表示される", async () => {
    renderApp();

    await sendExtMessage({ type: "activeSession", session: createSession({ title: "My Conversation" }) });

    expect(screen.getByText("My Conversation")).toBeInTheDocument();
  });

  it("セッションリストの開閉", async () => {
    const sessions = [createSession({ title: "Session A" }), createSession({ title: "Session B" })];
    await setupWithSessions(sessions);

    const user = userEvent.setup();

    // 初期状態ではリストは非表示
    expect(screen.queryByText("Session A")).not.toBeInTheDocument();

    // トグルボタンをクリックして開く
    await user.click(screen.getByTitle("Sessions"));
    expect(screen.getByText("Session A")).toBeInTheDocument();
    expect(screen.getByText("Session B")).toBeInTheDocument();

    // もう一度クリックして閉じる
    await user.click(screen.getByTitle("Sessions"));
    expect(screen.queryByText("Session A")).not.toBeInTheDocument();
  });

  it("セッション選択で selectSession が送信されリストが閉じる", async () => {
    const session = createSession({ title: "Target Session" });
    await setupWithSessions([session]);

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Sessions"));
    vi.mocked(postMessage).mockClear();

    await user.click(screen.getByText("Target Session"));

    expect(postMessage).toHaveBeenCalledWith({ type: "selectSession", sessionId: session.id });
    // リストが閉じている
    expect(screen.queryByText("Target Session")).not.toBeInTheDocument();
  });

  it("セッション削除で deleteSession が送信される", async () => {
    const session = createSession({ title: "To Delete" });
    await setupWithSessions([session]);

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Sessions"));
    vi.mocked(postMessage).mockClear();

    await user.click(screen.getByTitle("Delete"));

    expect(postMessage).toHaveBeenCalledWith({ type: "deleteSession", sessionId: session.id });
  });

  it("session.created イベントでセッションが追加される", async () => {
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

    expect(screen.getByText("New Session")).toBeInTheDocument();
    expect(screen.getByText("Existing")).toBeInTheDocument();
  });

  it("session.deleted イベントでセッションが削除される", async () => {
    const session = createSession({ title: "Will Be Deleted" });
    await setupWithSessions([session]);

    await sendExtMessage({
      type: "event",
      event: { type: "session.deleted", properties: { info: session } } as any,
    });

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Sessions"));

    expect(screen.queryByText("Will Be Deleted")).not.toBeInTheDocument();
    expect(screen.getByText("No sessions")).toBeInTheDocument();
  });

  it("session.updated イベントでタイトルが更新される", async () => {
    const session = createSession({ title: "Original Title" });
    renderApp();
    await sendExtMessage({ type: "sessions", sessions: [session] });
    await sendExtMessage({ type: "activeSession", session });

    expect(screen.getByText("Original Title")).toBeInTheDocument();

    await sendExtMessage({
      type: "event",
      event: { type: "session.updated", properties: { info: { ...session, title: "Updated Title" } } } as any,
    });

    expect(screen.getByText("Updated Title")).toBeInTheDocument();
  });

  it("activeSession を null にすると EmptyState に戻り messages がクリアされる", async () => {
    renderApp();
    const session = createSession({ id: "s1", title: "Active" });
    await sendExtMessage({ type: "activeSession", session });

    // メッセージを設定
    const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
    const part = createTextPart("Some response", { messageID: "m1" });
    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [{ info: msg, parts: [part] }],
    });
    expect(screen.getByText("Some response")).toBeInTheDocument();

    // activeSession を null に
    await sendExtMessage({ type: "activeSession", session: null });

    // EmptyState に戻る
    expect(screen.getByText("New Chat")).toBeInTheDocument();
    expect(screen.queryByText("Some response")).not.toBeInTheDocument();
  });

  it("session.updated でアクティブセッションのタイトルがヘッダーとセッション一覧の両方で更新される", async () => {
    const session = createSession({ id: "s1", title: "Before Update" });
    renderApp();
    await sendExtMessage({ type: "sessions", sessions: [session] });
    await sendExtMessage({ type: "activeSession", session });

    // ヘッダーに表示
    expect(screen.getByText("Before Update")).toBeInTheDocument();

    // session.updated イベント
    await sendExtMessage({
      type: "event",
      event: { type: "session.updated", properties: { info: { ...session, title: "After Update" } } } as any,
    });

    // ヘッダーが更新
    expect(screen.getByText("After Update")).toBeInTheDocument();

    // セッション一覧でも更新されている
    const user = userEvent.setup();
    await user.click(screen.getByTitle("Sessions"));
    expect(screen.getAllByText("After Update").length).toBeGreaterThanOrEqual(1);
  });

  it("セッション一覧の空状態で No sessions が表示される", async () => {
    await setupWithSessions([]);

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Sessions"));

    expect(screen.getByText("No sessions")).toBeInTheDocument();
  });

  it("セッションのサマリー（files/additions/deletions）が表示される", async () => {
    const session = createSession({
      title: "With Summary",
      summary: { files: 3, additions: 42, deletions: 7 },
    } as any);
    await setupWithSessions([session]);

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Sessions"));

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("+42")).toBeInTheDocument();
    expect(screen.getByText("-7")).toBeInTheDocument();
  });
});
