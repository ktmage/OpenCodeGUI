import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createMessage } from "../factories";

/** Reasoning パートを持つメッセージを表示するセットアップ */
async function setupWithReasoningPart(partOverrides: Record<string, unknown> = {}) {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

  const msg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
  const reasoningPart = {
    id: "rp1",
    type: "reasoning",
    text: "Let me think about this step by step...",
    messageID: "m1",
    time: { created: Date.now(), updated: Date.now() },
    ...partOverrides,
  };

  await sendExtMessage({
    type: "messages",
    sessionId: "s1",
    messages: [{ info: msg, parts: [reasoningPart as any] }],
  });
}

describe("12 思考表示（ReasoningPartView）", () => {
  it("進行中のリーズニングパートでスピナーと「Thinking…」が表示される", async () => {
    // time.end が undefined → 進行中
    await setupWithReasoningPart({ time: { created: Date.now() } });

    expect(screen.getByText("Thinking…")).toBeInTheDocument();
    // active クラスが付与されている
    const part = screen.getByText("Thinking…").closest(".reasoning-part");
    expect(part).toHaveClass("active");
    // spinner SVG が存在する
    expect(part!.querySelector(".tool-part-spinner")).toBeInTheDocument();
  });

  it("完了したリーズニングパートで「Thought」が表示される", async () => {
    await setupWithReasoningPart({ time: { created: Date.now(), end: Date.now() } });

    expect(screen.getByText("Thought")).toBeInTheDocument();
    const part = screen.getByText("Thought").closest(".reasoning-part");
    expect(part).toHaveClass("complete");
    // spinner が存在しない
    expect(part!.querySelector(".tool-part-spinner")).not.toBeInTheDocument();
  });

  it("ヘッダクリックで思考内容が展開・折りたたみされる", async () => {
    await setupWithReasoningPart({
      text: "Step 1: analyze the problem",
      time: { created: Date.now(), end: Date.now() },
    });

    const user = userEvent.setup();
    // 初期状態では本文は非表示
    expect(screen.queryByText("Step 1: analyze the problem")).not.toBeInTheDocument();

    // クリックで展開
    const header = screen.getByTitle("Toggle thought details");
    await user.click(header);
    expect(screen.getByText("Step 1: analyze the problem")).toBeInTheDocument();

    // 再クリックで折りたたみ
    await user.click(header);
    expect(screen.queryByText("Step 1: analyze the problem")).not.toBeInTheDocument();
  });
});
