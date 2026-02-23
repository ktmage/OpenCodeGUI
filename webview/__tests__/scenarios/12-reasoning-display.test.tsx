import { describe, it, expect, beforeEach } from "vitest";
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

// Reasoning display (ReasoningPartView)
describe("思考表示（ReasoningPartView）", () => {
  // In-progress reasoning part shows spinner and "Thinking..."
  context("進行中のリーズニングパートの場合", () => {
    let part: Element | null;

    beforeEach(async () => {
      await setupWithReasoningPart({ time: { created: Date.now() } });
      part = screen.getByText("Thinking\u2026").closest(".reasoning-part");
    });

    // Shows Thinking label
    it("Thinking\u2026 が表示されること", () => {
      expect(screen.getByText("Thinking\u2026")).toBeInTheDocument();
    });

    // Has active class
    it("active クラスが付与されること", () => {
      expect(part).toHaveClass("active");
    });

    // Shows spinner
    it("スピナーが表示されること", () => {
      expect(part!.querySelector(".tool-part-spinner")).toBeInTheDocument();
    });
  });

  // Completed reasoning part shows "Thought"
  context("完了したリーズニングパートの場合", () => {
    let part: Element | null;

    beforeEach(async () => {
      await setupWithReasoningPart({ time: { created: Date.now(), end: Date.now() } });
      part = screen.getByText("Thought").closest(".reasoning-part");
    });

    // Shows Thought label
    it("Thought が表示されること", () => {
      expect(screen.getByText("Thought")).toBeInTheDocument();
    });

    // Has complete class
    it("complete クラスが付与されること", () => {
      expect(part).toHaveClass("complete");
    });

    // No spinner
    it("スピナーが表示されないこと", () => {
      expect(part!.querySelector(".tool-part-spinner")).not.toBeInTheDocument();
    });
  });

  // Clicking header expands/collapses thought content
  context("ヘッダをクリックした場合", () => {
    beforeEach(async () => {
      await setupWithReasoningPart({
        text: "Step 1: analyze the problem",
        time: { created: Date.now(), end: Date.now() },
      });
    });

    // Initially collapsed
    it("初期状態では本文が非表示こと", () => {
      expect(screen.queryByText("Step 1: analyze the problem")).not.toBeInTheDocument();
    });

    // Expands on click
    context("展開した場合", () => {
      beforeEach(async () => {
        const user = userEvent.setup();
        await user.click(screen.getByTitle("Toggle thought details"));
      });

      // Shows content
      it("本文が表示されること", () => {
        expect(screen.getByText("Step 1: analyze the problem")).toBeInTheDocument();
      });

      // Collapses on second click
      context("再クリックした場合", () => {
        beforeEach(async () => {
          const user = userEvent.setup();
          await user.click(screen.getByTitle("Toggle thought details"));
        });

        // Hides content
        it("本文が非表示になること", () => {
          expect(screen.queryByText("Step 1: analyze the problem")).not.toBeInTheDocument();
        });
      });
    });
  });
});
