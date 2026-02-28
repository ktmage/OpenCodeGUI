import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { MessageWithParts } from "../../../App";
import { MessagesArea } from "../../../components/organisms/MessagesArea";
import { AppContextProvider, type AppContextValue } from "../../../contexts/AppContext";
import { createMessage, createTextPart } from "../../factories";

/** AppContext 必須の値を最小限で提供するラッパー */
function createContextWrapper() {
  const contextValue = {
    isShellMessage: () => false,
  } as unknown as AppContextValue;
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppContextProvider value={contextValue}>{children}</AppContextProvider>;
  };
}

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
  onForkFromCheckpoint: vi.fn(),
};

describe("MessagesArea", () => {
  const wrapper = createContextWrapper();

  // when rendered with messages
  context("メッセージがある場合", () => {
    // renders message items
    it("メッセージアイテムをレンダリングすること", () => {
      const { container } = render(<MessagesArea {...defaultProps} />, { wrapper });
      expect(container.querySelectorAll(".message").length).toBeGreaterThan(0);
    });
  });

  // when session is busy
  context("セッションが busy の場合", () => {
    // renders streaming indicator
    it("StreamingIndicator をレンダリングすること", () => {
      const { container } = render(<MessagesArea {...defaultProps} sessionBusy={true} />, { wrapper });
      expect(container.querySelector("[data-testid='streaming-indicator']")).toBeInTheDocument();
    });
  });

  // when session is not busy
  context("セッションが busy でない場合", () => {
    // does not render streaming indicator
    it("StreamingIndicator をレンダリングしないこと", () => {
      const { container } = render(<MessagesArea {...defaultProps} sessionBusy={false} />, { wrapper });
      expect(container.querySelector("[data-testid='streaming-indicator']")).not.toBeInTheDocument();
    });
  });

  // when messages have checkpoint dividers
  context("アシスタント→ユーザーの連続メッセージの場合", () => {
    const msgs: MessageWithParts[] = [
      { info: createMessage({ role: "assistant", id: "ast-1" }), parts: [createTextPart("Reply")] },
      { info: createMessage({ role: "user", id: "usr-1" }), parts: [createTextPart("Follow up")] },
    ];

    // renders checkpoint divider
    it("チェックポイント区切り線をレンダリングすること", () => {
      const { container } = render(<MessagesArea {...defaultProps} messages={msgs} />, { wrapper });
      expect(container.querySelector(".checkpointDivider")).toBeInTheDocument();
    });

    // renders fork button in checkpoint divider
    it("Fork ボタンをレンダリングすること", () => {
      render(<MessagesArea {...defaultProps} messages={msgs} />, { wrapper });
      expect(screen.getByText("Fork from here")).toBeInTheDocument();
    });

    // renders retry button in checkpoint divider
    it("Retry ボタンをレンダリングすること", () => {
      render(<MessagesArea {...defaultProps} messages={msgs} />, { wrapper });
      expect(screen.getByText("Retry from here")).toBeInTheDocument();
    });

    // calls onForkFromCheckpoint with next user message ID when fork button is clicked
    it("Fork ボタンクリック時に onForkFromCheckpoint を次のユーザーメッセージ ID で呼び出すこと", async () => {
      const onFork = vi.fn();
      render(<MessagesArea {...defaultProps} messages={msgs} onForkFromCheckpoint={onFork} />, { wrapper });
      const forkButton = screen.getByText("Fork from here").closest("button")!;
      await userEvent.click(forkButton);
      expect(onFork).toHaveBeenCalledWith("usr-1");
    });

    // calls onRevertToCheckpoint when retry button is clicked
    it("Retry ボタンクリック時に onRevertToCheckpoint を呼び出すこと", async () => {
      const onRevert = vi.fn();
      render(<MessagesArea {...defaultProps} messages={msgs} onRevertToCheckpoint={onRevert} />, { wrapper });
      const retryButton = screen.getByText("Retry from here").closest("button")!;
      await userEvent.click(retryButton);
      expect(onRevert).toHaveBeenCalledWith("usr-1", "Follow up");
    });
  });

  // when there are no checkpoint dividers (user only, assistant only)
  context("チェックポイントが存在しない場合", () => {
    // does not render fork button
    it("Fork ボタンをレンダリングしないこと", () => {
      const msgs: MessageWithParts[] = [{ info: createMessage({ role: "user" }), parts: [createTextPart("Hello")] }];
      render(<MessagesArea {...defaultProps} messages={msgs} />, { wrapper });
      expect(screen.queryByText("Fork from here")).not.toBeInTheDocument();
    });
  });
});
