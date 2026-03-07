import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createMessage, createSession, createTextPart } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** アクティブセッションを持つ状態をセットアップする */
async function setupActiveSession() {
  renderApp();
  const session = createSession({ id: "s1", title: "Chat" });
  await sendExtMessage({ type: "activeSession", session });
  vi.mocked(postMessage).mockClear();
  return session;
}

// Auto-scroll during streaming
describe("ストリーミング中の自動スクロール", () => {
  beforeEach(() => {
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
  });

  // scrollIntoView is called on initial mount
  it("初回マウント時に scrollIntoView が呼ばれること", async () => {
    await setupActiveSession();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  // scrollIntoView is called when messages update (user is near bottom by default)
  it("メッセージ受信時に scrollIntoView が呼ばれること", async () => {
    await setupActiveSession();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();

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

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  // scrollIntoView is called on streaming message updates
  it("ストリーミング中のメッセージ更新で scrollIntoView が呼ばれること", async () => {
    await setupActiveSession();

    // 最初のメッセージ
    const userMsg = createMessage({ id: "m1", sessionID: "s1", role: "user" });
    const userPart = createTextPart("Hello", { messageID: "m1" });
    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [{ info: userMsg, parts: [userPart] }],
    });

    vi.mocked(Element.prototype.scrollIntoView).mockClear();

    // ストリーミング中のアシスタントメッセージが追加される
    const assistantMsg = createMessage({ id: "m2", sessionID: "s1", role: "assistant" });
    const assistantPart = createTextPart("Streaming response...", { messageID: "m2" });
    await sendExtMessage({
      type: "messages",
      sessionId: "s1",
      messages: [
        { info: userMsg, parts: [userPart] },
        { info: assistantMsg, parts: [assistantPart] },
      ],
    });

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
