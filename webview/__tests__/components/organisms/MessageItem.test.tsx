import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MessageItem } from "../../../components/organisms/MessageItem";
import { createMessage, createTextPart, createToolPart } from "../../factories";
import type { MessageWithParts } from "../../../App";

describe("MessageItem", () => {
  const defaultProps = {
    activeSessionId: "session-1",
    permissions: new Map(),
    onEditAndResend: vi.fn(),
  };

  // when rendered with a user message
  context("ユーザーメッセージの場合", () => {
    const userMsg: MessageWithParts = {
      info: createMessage({ role: "user" }),
      parts: [createTextPart("Hello")],
    };

    // renders as user message
    it("ユーザーメッセージとしてレンダリングすること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={userMsg} />);
      expect(container.querySelector(".message-user")).toBeInTheDocument();
    });

    // renders user text
    it("ユーザーテキストを表示すること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={userMsg} />);
      expect(container.querySelector(".message-content")?.textContent).toBe("Hello");
    });

    // shows edit icon
    it("編集アイコンを表示すること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={userMsg} />);
      expect(container.querySelector(".message-edit-icon")).toBeInTheDocument();
    });
  });

  // when user message bubble is clicked
  context("ユーザーメッセージバブルをクリックした場合", () => {
    const userMsg: MessageWithParts = {
      info: createMessage({ role: "user" }),
      parts: [createTextPart("Hello")],
    };

    // enters edit mode
    it("編集モードに入ること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={userMsg} />);
      fireEvent.click(container.querySelector(".message-user-bubble")!);
      expect(container.querySelector(".message-edit-textarea")).toBeInTheDocument();
    });
  });

  // when rendered with an assistant message
  context("アシスタントメッセージの場合", () => {
    const assistantMsg: MessageWithParts = {
      info: createMessage({ role: "assistant" }),
      parts: [createTextPart("Response"), createToolPart("file_read")],
    };

    // renders as assistant message
    it("アシスタントメッセージとしてレンダリングすること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={assistantMsg} />);
      expect(container.querySelector(".message-assistant")).toBeInTheDocument();
    });

    // renders text and tool parts
    it("テキストとツールパートをレンダリングすること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={assistantMsg} />);
      expect(container.querySelector(".tool-part")).toBeInTheDocument();
    });
  });
});
