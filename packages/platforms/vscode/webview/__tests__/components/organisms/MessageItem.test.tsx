import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { MessageWithParts } from "../../../App";
import { MessageItem } from "../../../components/organisms/MessageItem";
import { AppContextProvider, type AppContextValue } from "../../../contexts/AppContext";
import { createMessage, createTextPart, createToolPart } from "../../factories";

/** AppContext 必須の値を最小限で提供するラッパー */
function createContextWrapper(overrides: Partial<AppContextValue> = {}) {
  const contextValue = {
    isShellMessage: () => false,
    ...overrides,
  } as unknown as AppContextValue;
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppContextProvider value={contextValue}>{children}</AppContextProvider>;
  };
}

describe("MessageItem", () => {
  const wrapper = createContextWrapper();
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
      const { container } = render(<MessageItem {...defaultProps} message={userMsg} />, { wrapper });
      expect(container.querySelector(".user")).toBeInTheDocument();
    });

    // renders user text
    it("ユーザーテキストを表示すること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={userMsg} />, { wrapper });
      expect(container.querySelector(".content")?.textContent).toBe("Hello");
    });

    // shows edit icon
    it("編集アイコンを表示すること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={userMsg} />, { wrapper });
      expect(container.querySelector(".editIcon")).toBeInTheDocument();
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
      const { container } = render(<MessageItem {...defaultProps} message={userMsg} />, { wrapper });
      fireEvent.click(container.querySelector(".userBubble")!);
      expect(container.querySelector(".editTextarea")).toBeInTheDocument();
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
      const { container } = render(<MessageItem {...defaultProps} message={assistantMsg} />, { wrapper });
      expect(container.querySelector(".assistant")).toBeInTheDocument();
    });

    // renders text and tool parts
    it("テキストとツールパートをレンダリングすること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={assistantMsg} />, { wrapper });
      expect(container.querySelector(".root")).toBeInTheDocument();
    });
  });

  // when rendered with a shell assistant message
  context("シェルコマンド結果のアシスタントメッセージの場合", () => {
    const shellWrapper = createContextWrapper({ isShellMessage: (id: string) => id === "shell-msg" });
    const shellMsg: MessageWithParts = {
      info: createMessage({ id: "shell-msg", role: "assistant" }),
      parts: [
        createTextPart("The following tool was executed by the user"),
        createToolPart("bash", {
          state: { status: "completed", title: "ls", input: { command: "ls" }, output: "file.txt" },
        } as any),
      ],
    };

    // renders ShellResultView instead of ToolPartView
    it("ShellResultView をレンダリングすること", () => {
      render(<MessageItem {...defaultProps} message={shellMsg} />, { wrapper: shellWrapper });
      expect(screen.getByText("Shell")).toBeInTheDocument();
    });

    // does not render the synthetic text part
    it("テキストパートを表示しないこと", () => {
      render(<MessageItem {...defaultProps} message={shellMsg} />, { wrapper: shellWrapper });
      expect(screen.queryByText("The following tool was executed by the user")).not.toBeInTheDocument();
    });
  });

  // when rendered with a shell user message
  context("シェルコマンドのユーザーメッセージの場合", () => {
    const shellWrapper = createContextWrapper({ isShellMessage: (id: string) => id === "shell-user" });
    const shellUserMsg: MessageWithParts = {
      info: createMessage({ id: "shell-user", role: "user" }),
      parts: [createTextPart("!ls -la")],
    };

    // hides user bubble
    it("ユーザー吹き出しが非表示であること", () => {
      const { container } = render(<MessageItem {...defaultProps} message={shellUserMsg} />, { wrapper: shellWrapper });
      expect(container.querySelector("[class*='userBubble']")).not.toBeInTheDocument();
    });
  });
});
