import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createMessage, createTextPart } from "../factories";

/** ユーザー→アシスタント→ユーザーの3メッセージ構成をセットアップする */
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

// Message editing and checkpoints
describe("メッセージ編集とチェックポイント", () => {
  // Clicking a user message enters edit mode
  context("ユーザーメッセージをクリックした場合", () => {
    beforeEach(async () => {
      await setupConversation();
      const user = userEvent.setup();
      await user.click(screen.getByText("First question"));
    });

    // Edit textarea is shown
    it("テキストエリアが表示されること", () => {
      expect(screen.getByDisplayValue("First question")).toBeInTheDocument();
    });

    // The element is a textarea
    it("要素が TEXTAREA であること", () => {
      expect(screen.getByDisplayValue("First question").tagName).toBe("TEXTAREA");
    });
  });

  // Submitting edited text with Enter sends editAndResend
  it("編集テキストを Enter で送信すると editAndResend が送信されること", async () => {
    await setupConversation();
    const user = userEvent.setup();

    // ユーザーメッセージ「Second question」をクリックして編集
    await user.click(screen.getByText("Second question"));

    const editTextarea = screen.getByDisplayValue("Second question");
    await user.clear(editTextarea);
    await user.type(editTextarea, "Revised question{Enter}");

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "editAndResend",
        sessionId: "s1",
        // Second question (m3) の前のメッセージ (m2) まで巻き戻す
        messageId: "m2",
        text: "Revised question",
      }),
    );
  });

  // Escape cancels editing
  context("Escape で編集をキャンセルした場合", () => {
    beforeEach(async () => {
      await setupConversation();
      const user = userEvent.setup();
      await user.click(screen.getByText("First question"));
      const editTextarea = screen.getByDisplayValue("First question");
      await user.type(editTextarea, " extra");
      await user.keyboard("{Escape}");
    });

    // Edit textarea is removed
    it("編集テキストエリアが消えること", () => {
      expect(screen.queryByDisplayValue("First question extra")).not.toBeInTheDocument();
    });

    // Original text is restored
    it("元のテキストが復元されること", () => {
      expect(screen.getByText("First question")).toBeInTheDocument();
    });
  });

  // Checkpoint separator is shown between assistant and user messages
  it("アシスタント→ユーザーの間にチェックポイント区切り線が表示されること", async () => {
    await setupConversation();

    // チェックポイントボタンが表示される
    expect(screen.getByText("Retry from here")).toBeInTheDocument();
  });

  // Clicking checkpoint sends revertToMessage and prefills the input
  context("チェックポイントをクリックした場合", () => {
    beforeEach(async () => {
      await setupConversation();
      const user = userEvent.setup();
      await user.click(screen.getByText("Retry from here"));
    });

    // Sends revertToMessage
    it("revertToMessage が送信されること", () => {
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "revertToMessage",
          sessionId: "s1",
          messageId: "m3",
        }),
      );
    });

    // Prefills the input with the reverted message text
    it("入力欄にテキストがプリフィルされること", () => {
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      expect(textarea).toHaveValue("Second question");
    });
  });

  // Editing the first message sends editAndResend with its own messageId
  it("最初のメッセージの編集では messageId 自体で editAndResend が送信されること", async () => {
    await setupConversation();
    const user = userEvent.setup();

    // 最初のユーザーメッセージ「First question」をクリックして編集
    await user.click(screen.getByText("First question"));

    const editTextarea = screen.getByDisplayValue("First question");
    await user.clear(editTextarea);
    await user.type(editTextarea, "Revised first{Enter}");

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "editAndResend",
        sessionId: "s1",
        // 最初のメッセージ (m1) の場合は messageId 自体が渡される
        messageId: "m1",
        text: "Revised first",
      }),
    );
  });

  // Empty text prevents edit submission
  it("空テキストでは編集送信されないこと", async () => {
    await setupConversation();
    const user = userEvent.setup();

    await user.click(screen.getByText("First question"));

    const editTextarea = screen.getByDisplayValue("First question");
    await user.clear(editTextarea);

    // Send ボタンが disabled
    const submitButton = screen.getByText("Send");
    expect(submitButton).toBeDisabled();
  });

  // Attached files in user messages are shown as chips
  it("ユーザーメッセージの添付ファイルがチップとして表示されること", async () => {
    renderApp();
    const session = createSession({ id: "s1", title: "Chat" });
    await sendExtMessage({ type: "activeSession", session });

    const userMsg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
    const textPart = createTextPart("Check this", { messageID: "m1" });
    const filePart = {
      id: "fp1",
      type: "file" as const,
      messageID: "m1",
      filename: "file:///workspace/src/main.ts",
      time: { created: Date.now(), updated: Date.now() },
    };

    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [{ info: userMsg, parts: [textPart, filePart as any] }],
    });

    // ファイル名がチップとして表示される
    expect(screen.getByText("main.ts")).toBeInTheDocument();
  });
});
