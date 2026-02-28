import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatHeader } from "../../../components/organisms/ChatHeader";
import { createSession } from "../../factories";

describe("ChatHeader", () => {
  const defaultProps = {
    activeSession: createSession({ title: "Test Session" }),
    onNewSession: vi.fn(),
    onToggleSessionList: vi.fn(),
  };

  // when rendered with an active session
  context("アクティブセッションがある場合", () => {
    // renders the session title
    it("セッションタイトルを表示すること", () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      expect(container.querySelector(".chat-header-title")?.textContent).toBe("Test Session");
    });

    // renders the session list button
    it("セッションリストボタンをレンダリングすること", () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      expect(container.querySelectorAll(".icon-button").length).toBeGreaterThan(0);
    });
  });

  // when new session button is clicked
  context("新規セッションボタンをクリックした場合", () => {
    // calls onNewSession
    it("onNewSession が呼ばれること", () => {
      const onNewSession = vi.fn();
      const { container } = render(<ChatHeader {...defaultProps} onNewSession={onNewSession} />);
      const buttons = container.querySelectorAll(".icon-button");
      // New chat button is the second icon-button
      fireEvent.click(buttons[buttons.length - 1]!);
      expect(onNewSession).toHaveBeenCalledOnce();
    });
  });

  // when session list button is clicked
  context("セッションリストボタンをクリックした場合", () => {
    // calls onToggleSessionList
    it("onToggleSessionList が呼ばれること", () => {
      const onToggleSessionList = vi.fn();
      const { container } = render(<ChatHeader {...defaultProps} onToggleSessionList={onToggleSessionList} />);
      const buttons = container.querySelectorAll(".icon-button");
      fireEvent.click(buttons[0]!);
      expect(onToggleSessionList).toHaveBeenCalledOnce();
    });
  });

  // when activeSession is null
  context("アクティブセッションが null の場合", () => {
    // renders fallback title
    it("フォールバックタイトルを表示すること", () => {
      const { container } = render(<ChatHeader {...defaultProps} activeSession={null} />);
      expect(container.querySelector(".chat-header-title")?.textContent).toBeTruthy();
    });
  });
});
