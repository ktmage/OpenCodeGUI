import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createMessage, createTextPart } from "../factories";

/** アクティブセッションを持つ状態をセットアップする */
async function setupActiveSession() {
  renderApp();
  const session = createSession({ id: "s1", title: "Chat" });
  await sendExtMessage({ type: "activeSession", session });
  vi.mocked(postMessage).mockClear();
  return session;
}

describe("03 メッセージング", () => {
  it("テキスト入力 + Enter で sendMessage が送信される", async () => {
    const session = await setupActiveSession();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "Hello world{Enter}");

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "sendMessage",
        sessionId: session.id,
        text: "Hello world",
      }),
    );
  });

  it("空テキスト + Enter では送信されない", async () => {
    await setupActiveSession();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "{Enter}");

    expect(postMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "sendMessage" }),
    );
  });

  it("messages 受信でメッセージが表示される", async () => {
    await setupActiveSession();

    const userMsg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
    const userPart = createTextPart("User question", { messageID: "m1" });
    const assistantMsg = createMessage({ id: "m2", sessionID: "s1", role: "assistant" });
    const assistantPart = createTextPart("Assistant answer", { messageID: "m2" });

    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [
        { info: userMsg, parts: [userPart] },
        { info: assistantMsg, parts: [assistantPart] },
      ],
    });

    expect(screen.getByText("User question")).toBeInTheDocument();
    expect(screen.getByText("Assistant answer")).toBeInTheDocument();
  });

  it("message.updated イベントで新しいメッセージが追加される", async () => {
    await setupActiveSession();

    // 初期メッセージを設定
    const existingMsg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
    const existingPart = createTextPart("First message", { messageID: "m1" });
    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [{ info: existingMsg, parts: [existingPart] }],
    });

    // SSE で新しいメッセージが追加される
    const newMsg = createMessage({ id: "m2", sessionID: "s1", role: "assistant" });
    await sendExtMessage({
      type: "event",
      event: { type: "message.updated", properties: { info: newMsg } } as any,
    });

    // message.part.updated でテキストパートを追加
    const newPart = createTextPart("New response", { messageID: "m2" });
    await sendExtMessage({
      type: "event",
      event: { type: "message.part.updated", properties: { part: newPart } } as any,
    });

    expect(screen.getByText("New response")).toBeInTheDocument();
  });

  it("session.status busy で StreamingIndicator と停止ボタンが表示される", async () => {
    await setupActiveSession();

    await sendExtMessage({
      type: "event",
      event: { type: "session.status", properties: { status: { type: "busy" } } } as any,
    });

    // StreamingIndicator が表示される（dotアニメーション）
    const dots = document.querySelectorAll(".streaming-dot");
    expect(dots.length).toBe(3);

    // 停止ボタンが表示される
    expect(screen.getByTitle("Stop")).toBeInTheDocument();
  });

  it("session.status idle で送信ボタンに戻る", async () => {
    await setupActiveSession();

    // busy にする
    await sendExtMessage({
      type: "event",
      event: { type: "session.status", properties: { status: { type: "busy" } } } as any,
    });
    expect(screen.getByTitle("Stop")).toBeInTheDocument();

    // idle に戻す
    await sendExtMessage({
      type: "event",
      event: { type: "session.status", properties: { status: { type: "idle" } } } as any,
    });

    expect(screen.getByTitle("Send")).toBeInTheDocument();
    expect(screen.queryByTitle("Stop")).not.toBeInTheDocument();
  });

  it("停止ボタン押下で abort が送信される", async () => {
    const session = await setupActiveSession();

    await sendExtMessage({
      type: "event",
      event: { type: "session.status", properties: { status: { type: "busy" } } } as any,
    });

    const user = userEvent.setup();
    await user.click(screen.getByTitle("Stop"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "abort",
      sessionId: session.id,
    });
  });

  it("message.removed イベントでメッセージが削除される", async () => {
    await setupActiveSession();

    const msg1 = createMessage({ id: "m1", sessionID: "s1", role: "user" });
    const part1 = createTextPart("Keep this", { messageID: "m1" });
    const msg2 = createMessage({ id: "m2", sessionID: "s1", role: "assistant" });
    const part2 = createTextPart("Remove this", { messageID: "m2" });

    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [
        { info: msg1, parts: [part1] },
        { info: msg2, parts: [part2] },
      ],
    });

    expect(screen.getByText("Remove this")).toBeInTheDocument();

    await sendExtMessage({
      type: "event",
      event: { type: "message.removed", properties: { messageID: "m2" } } as any,
    });

    expect(screen.queryByText("Remove this")).not.toBeInTheDocument();
    expect(screen.getByText("Keep this")).toBeInTheDocument();
  });
});
