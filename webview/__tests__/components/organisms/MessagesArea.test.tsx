import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { MessageWithParts } from "../../../App";
import { MessagesArea } from "../../../components/organisms/MessagesArea";
import { createMessage, createTextPart } from "../../factories";

const userMsg: MessageWithParts = {
  info: createMessage({ role: "user" }),
  parts: [createTextPart("Hello")],
};

const assistantMsg: MessageWithParts = {
  info: createMessage({ role: "assistant" }),
  parts: [createTextPart("Hi there")],
};

const defaultProps = {
  messages: [userMsg, assistantMsg],
  sessionBusy: false,
  activeSessionId: "session-1",
  permissions: new Map(),
  onEditAndResend: vi.fn(),
  onRevertToCheckpoint: vi.fn(),
};

describe("MessagesArea", () => {
  // when rendered with messages
  context("メッセージがある場合", () => {
    // renders message items
    it("メッセージアイテムをレンダリングすること", () => {
      const { container } = render(<MessagesArea {...defaultProps} />);
      expect(container.querySelectorAll(".message").length).toBeGreaterThan(0);
    });
  });

  // when session is busy
  context("セッションが busy の場合", () => {
    // renders streaming indicator
    it("StreamingIndicator をレンダリングすること", () => {
      const { container } = render(<MessagesArea {...defaultProps} sessionBusy={true} />);
      expect(container.querySelector("[data-testid='streaming-indicator']")).toBeInTheDocument();
    });
  });

  // when session is not busy
  context("セッションが busy でない場合", () => {
    // does not render streaming indicator
    it("StreamingIndicator をレンダリングしないこと", () => {
      const { container } = render(<MessagesArea {...defaultProps} sessionBusy={false} />);
      expect(container.querySelector("[data-testid='streaming-indicator']")).not.toBeInTheDocument();
    });
  });

  // when messages have checkpoint dividers
  context("アシスタント→ユーザーの連続メッセージの場合", () => {
    // renders checkpoint divider
    it("チェックポイント区切り線をレンダリングすること", () => {
      const msgs: MessageWithParts[] = [
        { info: createMessage({ role: "assistant" }), parts: [createTextPart("Reply")] },
        { info: createMessage({ role: "user" }), parts: [createTextPart("Follow up")] },
      ];
      const { container } = render(<MessagesArea {...defaultProps} messages={msgs} />);
      expect(container.querySelector(".checkpointDivider")).toBeInTheDocument();
    });
  });
});
