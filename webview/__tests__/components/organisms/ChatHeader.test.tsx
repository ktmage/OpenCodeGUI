import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatHeader } from "../../../components/organisms/ChatHeader";
import { createSession } from "../../factories";

describe("ChatHeader", () => {
  const defaultProps = {
    activeSession: createSession({ title: "Test Session" }),
    onNewSession: vi.fn(),
    onToggleSessionList: vi.fn(),
    onShareSession: vi.fn(),
    onUnshareSession: vi.fn(),
    canUndo: false,
    canRedo: false,
    isBusy: false,
  };

  // when rendered with an active session
  context("アクティブセッションがある場合", () => {
    // renders the session title
    it("セッションタイトルを表示すること", () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      expect(container.querySelector(".title")?.textContent).toBe("Test Session");
    });

    // renders the session list button
    it("セッションリストボタンをレンダリングすること", () => {
      const { container } = render(<ChatHeader {...defaultProps} />);
      expect(container.querySelectorAll("button").length).toBeGreaterThan(0);
    });

    // renders the share button
    it("共有ボタンを表示すること", () => {
      const { getByTitle } = render(<ChatHeader {...defaultProps} />);
      expect(getByTitle("Share session")).toBeInTheDocument();
    });
  });

  // when new session button is clicked
  context("新規セッションボタンをクリックした場合", () => {
    // calls onNewSession
    it("onNewSession が呼ばれること", () => {
      const onNewSession = vi.fn();
      const { container } = render(<ChatHeader {...defaultProps} onNewSession={onNewSession} />);
      const buttons = container.querySelectorAll("button");
      // New chat button is the last icon-button
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
      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[0]!);
      expect(onToggleSessionList).toHaveBeenCalledOnce();
    });
  });

  // when activeSession is null
  context("アクティブセッションが null の場合", () => {
    // renders fallback title
    it("フォールバックタイトルを表示すること", () => {
      const { container } = render(<ChatHeader {...defaultProps} activeSession={null} />);
      expect(container.querySelector(".title")?.textContent).toBeTruthy();
    });

    // does not render share button
    it("共有ボタンを表示しないこと", () => {
      const { queryByTitle } = render(<ChatHeader {...defaultProps} activeSession={null} />);
      expect(queryByTitle("Share session")).not.toBeInTheDocument();
    });
  });

  // when share button is clicked (not shared)
  context("未共有セッションで共有ボタンをクリックした場合", () => {
    // calls onShareSession
    it("onShareSession が呼ばれること", () => {
      const onShareSession = vi.fn();
      const { getByTitle } = render(<ChatHeader {...defaultProps} onShareSession={onShareSession} />);
      fireEvent.click(getByTitle("Share session"));
      expect(onShareSession).toHaveBeenCalledOnce();
    });
  });

  // when session is shared
  context("共有中のセッションの場合", () => {
    const sharedSession = createSession({
      title: "Shared Session",
      share: { url: "https://share.example.com/abc" },
    });

    // renders unshare button
    it("共有解除ボタンを表示すること", () => {
      const { getByTitle } = render(<ChatHeader {...defaultProps} activeSession={sharedSession} />);
      expect(getByTitle("Unshare session")).toBeInTheDocument();
    });

    // calls onUnshareSession when clicked
    it("クリック時に onUnshareSession が呼ばれること", () => {
      const onUnshareSession = vi.fn();
      const { getByTitle } = render(
        <ChatHeader {...defaultProps} activeSession={sharedSession} onUnshareSession={onUnshareSession} />,
      );
      fireEvent.click(getByTitle("Unshare session"));
      expect(onUnshareSession).toHaveBeenCalledOnce();
    });
  });

  // when navigating child session
  context("子セッション閲覧中の場合", () => {
    // does not render share button
    it("共有ボタンを表示しないこと", () => {
      const { queryByTitle } = render(<ChatHeader {...defaultProps} onNavigateToParent={() => {}} />);
      expect(queryByTitle("Share session")).not.toBeInTheDocument();
    });
  });

  // when onShareSession is not provided (empty session)
  context("onShareSession が未指定の場合（空セッション）", () => {
    // does not render share button
    it("共有ボタンを表示しないこと", () => {
      const { queryByTitle } = render(<ChatHeader {...defaultProps} onShareSession={undefined} />);
      expect(queryByTitle("Share session")).not.toBeInTheDocument();
    });
  });

  // Undo/Redo buttons
  context("Undo/Redo ボタンの場合", () => {
    // renders undo button
    it("Undo ボタンを表示すること", () => {
      const { getByTitle } = render(<ChatHeader {...defaultProps} canUndo canRedo={false} />);
      expect(getByTitle("Undo")).toBeInTheDocument();
    });

    // renders redo button
    it("Redo ボタンを表示すること", () => {
      const { getByTitle } = render(<ChatHeader {...defaultProps} canUndo={false} canRedo />);
      expect(getByTitle("Redo")).toBeInTheDocument();
    });

    // disables undo when canUndo is false
    it("canUndo=false のとき Undo ボタンが disabled になること", () => {
      const { getByTitle } = render(<ChatHeader {...defaultProps} canUndo={false} />);
      expect((getByTitle("Undo") as HTMLButtonElement).disabled).toBe(true);
    });

    // disables redo when canRedo is false
    it("canRedo=false のとき Redo ボタンが disabled になること", () => {
      const { getByTitle } = render(<ChatHeader {...defaultProps} canRedo={false} />);
      expect((getByTitle("Redo") as HTMLButtonElement).disabled).toBe(true);
    });

    // disables both when busy
    it("isBusy=true のとき Undo ボタンが disabled になること", () => {
      const { getByTitle } = render(<ChatHeader {...defaultProps} canUndo canRedo isBusy />);
      expect((getByTitle("Undo") as HTMLButtonElement).disabled).toBe(true);
    });

    // calls onUndo when clicked
    it("クリック時に onUndo が呼ばれること", () => {
      const onUndo = vi.fn();
      const { getByTitle } = render(<ChatHeader {...defaultProps} canUndo onUndo={onUndo} />);
      fireEvent.click(getByTitle("Undo"));
      expect(onUndo).toHaveBeenCalledOnce();
    });

    // calls onRedo when clicked
    it("クリック時に onRedo が呼ばれること", () => {
      const onRedo = vi.fn();
      const { getByTitle } = render(<ChatHeader {...defaultProps} canRedo onRedo={onRedo} />);
      fireEvent.click(getByTitle("Redo"));
      expect(onRedo).toHaveBeenCalledOnce();
    });

    // does not render undo/redo when in child session
    it("子セッション閲覧中は Undo/Redo ボタンを表示しないこと", () => {
      const { queryByTitle } = render(<ChatHeader {...defaultProps} onNavigateToParent={() => {}} canUndo canRedo />);
      expect(queryByTitle("Undo")).not.toBeInTheDocument();
    });

    // does not render undo/redo when no active session
    it("アクティブセッションがない場合は Undo/Redo ボタンを表示しないこと", () => {
      const { queryByTitle } = render(<ChatHeader {...defaultProps} activeSession={null} canUndo canRedo />);
      expect(queryByTitle("Undo")).not.toBeInTheDocument();
    });
  });
});
