import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAutoScroll } from "../../hooks/useAutoScroll";

describe("useAutoScroll", () => {
  // initial state
  context("初期状態の場合", () => {
    // isNearBottom defaults to true
    it("containerRef と bottomRef を返すこと", () => {
      const { result } = renderHook(() => useAutoScroll([]));
      expect(result.current.containerRef).toBeDefined();
      expect(result.current.bottomRef).toBeDefined();
    });

    // returns handleScroll callback
    it("handleScroll コールバックを返すこと", () => {
      const { result } = renderHook(() => useAutoScroll([]));
      expect(typeof result.current.handleScroll).toBe("function");
    });
  });

  // on mount
  context("マウント時の場合", () => {
    // bottomRef is null on mount in renderHook (no DOM attachment)
    // scrollIntoView is only called when bottomRef.current exists;
    // real DOM integration is verified in MessagesArea component tests
    // isNearBottom defaults to true
    it("isNearBottom がデフォルトで true であること（メッセージ更新で scrollIntoView が呼ばれること）", () => {
      const scrollIntoViewMock = vi.fn();
      const { result, rerender } = renderHook(({ messages }) => useAutoScroll(messages), {
        initialProps: { messages: [] as unknown[] },
      });

      // bottomRef にモック要素を手動設定
      const bottomEl = document.createElement("div");
      bottomEl.scrollIntoView = scrollIntoViewMock;
      (result.current.bottomRef as React.MutableRefObject<HTMLDivElement | null>).current = bottomEl;

      // messages 更新で isNearBottom(デフォルト true) により scrollIntoView が呼ばれる
      rerender({ messages: ["msg1"] });

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
    });
  });

  // when messages update and user is near bottom
  context("ユーザーが最下部付近にいてメッセージが更新された場合", () => {
    // scrolls to bottom
    it("scrollIntoView が呼ばれること", () => {
      const scrollIntoViewMock = vi.fn();
      const { result, rerender } = renderHook(({ messages }) => useAutoScroll(messages), {
        initialProps: { messages: ["msg1"] as unknown[] },
      });

      // bottomRef にモック要素を設定
      const bottomEl = document.createElement("div");
      bottomEl.scrollIntoView = scrollIntoViewMock;
      (result.current.bottomRef as React.MutableRefObject<HTMLDivElement | null>).current = bottomEl;

      // isNearBottom はデフォルト true なので、メッセージ更新でスクロールされるはず
      rerender({ messages: ["msg1", "msg2"] });

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
    });
  });

  // when messages update and user is NOT near bottom
  context("ユーザーが上部にスクロールしていてメッセージが更新された場合", () => {
    // does not scroll to bottom
    it("scrollIntoView が呼ばれないこと", () => {
      const scrollIntoViewMock = vi.fn();
      const { result, rerender } = renderHook(({ messages }) => useAutoScroll(messages), {
        initialProps: { messages: ["msg1"] as unknown[] },
      });

      // containerRef にモック要素を設定し、上部にスクロールしている状態をシミュレート
      const containerEl = document.createElement("div");
      Object.defineProperty(containerEl, "scrollHeight", { value: 1000 });
      Object.defineProperty(containerEl, "scrollTop", { value: 0 });
      Object.defineProperty(containerEl, "clientHeight", { value: 400 });
      (result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = containerEl;

      // bottomRef にモック要素を設定
      const bottomEl = document.createElement("div");
      bottomEl.scrollIntoView = scrollIntoViewMock;
      (result.current.bottomRef as React.MutableRefObject<HTMLDivElement | null>).current = bottomEl;

      // onScroll を呼んで isNearBottom を false にする
      act(() => {
        result.current.handleScroll();
      });

      // scrollIntoViewMock をリセット
      scrollIntoViewMock.mockClear();

      // メッセージ更新
      rerender({ messages: ["msg1", "msg2"] });

      expect(scrollIntoViewMock).not.toHaveBeenCalled();
    });
  });

  // when user scrolls back to bottom
  context("ユーザーが最下部に戻った後にメッセージが更新された場合", () => {
    // resumes auto-scrolling
    it("scrollIntoView が再び呼ばれること", () => {
      const scrollIntoViewMock = vi.fn();
      const { result, rerender } = renderHook(({ messages }) => useAutoScroll(messages), {
        initialProps: { messages: ["msg1"] as unknown[] },
      });

      // containerRef を設定（上部にスクロール中）
      const containerEl = document.createElement("div");
      Object.defineProperty(containerEl, "scrollHeight", { value: 1000, configurable: true });
      Object.defineProperty(containerEl, "scrollTop", { value: 0, configurable: true });
      Object.defineProperty(containerEl, "clientHeight", { value: 400, configurable: true });
      (result.current.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = containerEl;

      // bottomRef にモック要素を設定
      const bottomEl = document.createElement("div");
      bottomEl.scrollIntoView = scrollIntoViewMock;
      (result.current.bottomRef as React.MutableRefObject<HTMLDivElement | null>).current = bottomEl;

      // 上にスクロールして isNearBottom = false にする
      act(() => {
        result.current.handleScroll();
      });

      // 下に戻して isNearBottom = true にする
      Object.defineProperty(containerEl, "scrollTop", { value: 950, configurable: true });
      act(() => {
        result.current.handleScroll();
      });

      scrollIntoViewMock.mockClear();

      // メッセージ更新
      rerender({ messages: ["msg1", "msg2", "msg3"] });

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
    });
  });
});
