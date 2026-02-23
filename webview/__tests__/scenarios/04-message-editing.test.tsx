import { describe, it, expect, vi } from "vitest";
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

describe("04 メッセージ編集とチェックポイント", () => {
  it("ユーザーメッセージをクリックすると編集モードになる", async () => {
    await setupConversation();
    const user = userEvent.setup();

    // ユーザーメッセージのバブルをクリック
    const bubble = screen.getByText("First question");
    await user.click(bubble);

    // テキストエリアが表示される
    const editTextarea = screen.getByDisplayValue("First question");
    expect(editTextarea).toBeInTheDocument();
    expect(editTextarea.tagName).toBe("TEXTAREA");
  });

  it("編集テキストを Enter で送信すると editAndResend が送信される", async () => {
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

  it("Escape で編集がキャンセルされる", async () => {
    await setupConversation();
    const user = userEvent.setup();

    await user.click(screen.getByText("First question"));

    const editTextarea = screen.getByDisplayValue("First question");
    await user.type(editTextarea, " extra");
    await user.keyboard("{Escape}");

    // 編集モードが終了し、元のテキストが表示される
    expect(screen.queryByDisplayValue("First question extra")).not.toBeInTheDocument();
    expect(screen.getByText("First question")).toBeInTheDocument();
  });

  it("アシスタント→ユーザーの間にチェックポイント区切り線が表示される", async () => {
    await setupConversation();

    // チェックポイントボタンが表示される
    expect(screen.getByText("Retry from here")).toBeInTheDocument();
  });

  it("チェックポイントをクリックすると revertToMessage が送信されテキストがプリフィルされる", async () => {
    await setupConversation();
    const user = userEvent.setup();

    await user.click(screen.getByText("Retry from here"));

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "revertToMessage",
        sessionId: "s1",
        // ユーザーメッセージ (m3) の ID でリバート
        messageId: "m3",
      }),
    );

    // 入力欄に「Second question」がプリフィルされる
    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    expect(textarea).toHaveValue("Second question");
  });

  it("最初のメッセージの編集では messageId 自体で editAndResend が送信される", async () => {
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

  it("空テキストでは編集送信されない", async () => {
    await setupConversation();
    const user = userEvent.setup();

    await user.click(screen.getByText("First question"));

    const editTextarea = screen.getByDisplayValue("First question");
    await user.clear(editTextarea);

    // Send ボタンが disabled
    const submitButton = screen.getByText("Send");
    expect(submitButton).toBeDisabled();
  });

  it("ユーザーメッセージの添付ファイルがチップとして表示される", async () => {
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
