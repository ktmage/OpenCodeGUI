import { describe, it, expect, vi, beforeEach } from "vitest";
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

// Messaging
describe("メッセージング", () => {
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
  context("messages 受信時", () => {
    beforeEach(async () => {
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
    });

    // User message is shown
    it("ユーザーメッセージが表示される", () => {
      expect(screen.getByText("User question")).toBeInTheDocument();
    });

    // Assistant message is shown
    it("アシスタントメッセージが表示される", () => {
      expect(screen.getByText("Assistant answer")).toBeInTheDocument();
    });
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
  context("session.status busy のとき", () => {
    beforeEach(async () => {
      await setupActiveSession();

      await sendExtMessage({
        type: "event",
        event: { type: "session.status", properties: { status: { type: "busy" } } } as any,
      });
    });

    // StreamingIndicator shows 3 dots
    it("StreamingIndicator のドットが3つ表示される", () => {
      const dots = document.querySelectorAll(".streaming-dot");
      expect(dots.length).toBe(3);
    });

    // Stop button is shown
    it("停止ボタンが表示される", () => {
      expect(screen.getByTitle("Stop")).toBeInTheDocument();
    });
  });

  // session.status idle restores send button
  context("session.status idle に戻したとき", () => {
    beforeEach(async () => {
      await setupActiveSession();

      await sendExtMessage({
        type: "event",
        event: { type: "session.status", properties: { status: { type: "busy" } } } as any,
      });

      await sendExtMessage({
        type: "event",
        event: { type: "session.status", properties: { status: { type: "idle" } } } as any,
      });
    });

    // Send button is shown
    it("送信ボタンが表示される", () => {
      expect(screen.getByTitle("Send")).toBeInTheDocument();
    });

    // Stop button is hidden
    it("停止ボタンが非表示になる", () => {
      expect(screen.queryByTitle("Stop")).not.toBeInTheDocument();
    });
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
  context("message.removed イベント受信時", () => {
    beforeEach(async () => {
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

      await sendExtMessage({
        type: "event",
        event: { type: "message.removed", properties: { messageID: "m2" } } as any,
      });
    });

    // Removed message is no longer shown
    it("削除されたメッセージが非表示になる", () => {
      expect(screen.queryByText("Remove this")).not.toBeInTheDocument();
    });

    // Remaining message is still shown
    it("残りのメッセージはそのまま表示される", () => {
      expect(screen.getByText("Keep this")).toBeInTheDocument();
    });
  });

  // Messages from a different session are ignored
  context("別セッションの messages 受信時", () => {
    beforeEach(async () => {
      await setupActiveSession();

      const msg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
      const part = createTextPart("Original message", { messageID: "m1" });
      await sendExtMessage({
        type: "messages",
        sessionId: "s1",
        messages: [{ info: msg, parts: [part] }],
      });

      const otherMsg = createMessage({ id: "m99", sessionID: "s2", role: "user" });
      const otherPart = createTextPart("Other session message", { messageID: "m99" });
      await sendExtMessage({
        type: "messages",
        sessionId: "s2",
        messages: [{ info: otherMsg, parts: [otherPart] }],
      });
    });

    // Original session messages remain
    it("元セッションのメッセージはそのまま", () => {
      expect(screen.getByText("Original message")).toBeInTheDocument();
    });

    // Other session messages are not shown
    it("他セッションのメッセージは表示されない", () => {
      expect(screen.queryByText("Other session message")).not.toBeInTheDocument();
    });
  });

  // message.part.updated with non-existent messageID is ignored
  context("存在しない messageID で message.part.updated 受信時", () => {
    beforeEach(async () => {
      await setupActiveSession();

      const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
      const part = createTextPart("Existing", { messageID: "m1" });
      await sendExtMessage({
        type: "messages",
        sessionId: "s1",
        messages: [{ info: msg, parts: [part] }],
      });

      const orphanPart = createTextPart("Orphan", { messageID: "nonexistent" });
      await sendExtMessage({
        type: "event",
        event: { type: "message.part.updated", properties: { part: orphanPart } } as any,
      });
    });

    // Existing message remains
    it("既存メッセージに影響がない", () => {
      expect(screen.getByText("Existing")).toBeInTheDocument();
    });

    // Orphan part is not shown
    it("孤立パートは表示されない", () => {
      expect(screen.queryByText("Orphan")).not.toBeInTheDocument();
    });
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
