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

// 03 Messaging
describe("03 メッセージング", () => {
  // Text input + Enter sends sendMessage
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

  // Empty text + Enter does not send
  it("空テキスト + Enter では送信されない", async () => {
    await setupActiveSession();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "{Enter}");

    expect(postMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "sendMessage" }),
    );
  });

  // Received messages are displayed
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

  // message.updated event appends a new message
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

  // session.status busy shows StreamingIndicator and stop button
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

  // session.status idle restores send button
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

  // Clicking stop button sends abort
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

  // message.removed event deletes the message
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

  // Messages from a different session are ignored
  it("別セッションの messages は無視される", async () => {
    await setupActiveSession();

    // アクティブセッション s1 のメッセージを設定
    const msg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
    const part = createTextPart("Original message", { messageID: "m1" });
    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [{ info: msg, parts: [part] }],
    });
    expect(screen.getByText("Original message")).toBeInTheDocument();

    // 別セッション s2 の messages を送信
    const otherMsg = createMessage({ id: "m99", sessionID: "s2", role: "user" });
    const otherPart = createTextPart("Other session message", { messageID: "m99" });
    await sendExtMessage({
      type: "messages",
      sessionId: "s2",
      messages: [{ info: otherMsg, parts: [otherPart] }],
    });

    // s1 のメッセージはそのまま、s2 のメッセージは表示されない
    expect(screen.getByText("Original message")).toBeInTheDocument();
    expect(screen.queryByText("Other session message")).not.toBeInTheDocument();
  });

  // message.part.updated with non-existent messageID is ignored
  it("message.part.updated で存在しない messageID のパートは無視される", async () => {
    await setupActiveSession();

    const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
    const part = createTextPart("Existing", { messageID: "m1" });
    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [{ info: msg, parts: [part] }],
    });

    // 存在しない messageID でパート更新
    const orphanPart = createTextPart("Orphan", { messageID: "nonexistent" });
    await sendExtMessage({
      type: "event",
      event: { type: "message.part.updated", properties: { part: orphanPart } } as any,
    });

    // 元のメッセージに影響なし、orphan は表示されない
    expect(screen.getByText("Existing")).toBeInTheDocument();
    expect(screen.queryByText("Orphan")).not.toBeInTheDocument();
  });

  // sendMessage includes selectedModel
  it("sendMessage に selectedModel が含まれる", async () => {
    renderApp();

    // プロバイダーとモデルを設定
    const { createProvider, createAllProvidersData } = await import("../factories");
    const provider = createProvider("anthropic", {
      "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } },
    });
    await sendExtMessage({
      type: "providers",
      providers: [provider],
      allProviders: createAllProvidersData(["anthropic"], [
        { id: "anthropic", name: "Anthropic", models: { "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } } } },
      ]),
      default: { general: "anthropic/claude-4-opus" },
      configModel: "anthropic/claude-4-opus",
    });

    const session = createSession({ id: "s1" });
    await sendExtMessage({ type: "activeSession", session });
    vi.mocked(postMessage).mockClear();

    const user = userEvent.setup();
    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "Hello{Enter}");

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "sendMessage",
        sessionId: "s1",
        text: "Hello",
        model: { providerID: "anthropic", modelID: "claude-4-opus" },
      }),
    );
  });
});
