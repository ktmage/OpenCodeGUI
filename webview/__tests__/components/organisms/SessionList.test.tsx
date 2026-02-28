import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { formatRelativeTime, SessionList } from "../../../components/organisms/SessionList";
import { en } from "../../../locales/en";
import { ja } from "../../../locales/ja";
import { createSession } from "../../factories";

const sessions = [createSession({ id: "s1", title: "Session 1" }), createSession({ id: "s2", title: "Session 2" })];

const defaultProps = {
  sessions,
  activeSessionId: "s1",
  onSelect: vi.fn(),
  onDelete: vi.fn(),
  onClose: vi.fn(),
};

describe("SessionList", () => {
  // when rendered with sessions
  context("セッションがある場合", () => {
    // renders all session items
    it("全セッションアイテムをレンダリングすること", () => {
      const { container } = render(<SessionList {...defaultProps} />);
      expect(container.querySelectorAll(".item")).toHaveLength(2);
    });

    // highlights the active session
    it("アクティブセッションをハイライトすること", () => {
      const { container } = render(<SessionList {...defaultProps} />);
      expect(container.querySelector(".item.active")).toBeInTheDocument();
    });
  });

  // when a session is clicked
  context("セッションをクリックした場合", () => {
    // calls onSelect
    it("onSelect が呼ばれること", () => {
      const onSelect = vi.fn();
      const { container } = render(<SessionList {...defaultProps} onSelect={onSelect} />);
      fireEvent.click(container.querySelectorAll(".item")[1]!);
      expect(onSelect).toHaveBeenCalledWith("s2");
    });
  });

  // when delete button is clicked
  context("削除ボタンをクリックした場合", () => {
    // calls onDelete
    it("onDelete が呼ばれること", () => {
      const onDelete = vi.fn();
      const { container } = render(<SessionList {...defaultProps} onDelete={onDelete} />);
      fireEvent.click(container.querySelector(".itemDelete")!);
      expect(onDelete).toHaveBeenCalledWith("s1");
    });
  });

  // when there are no sessions
  context("セッションがない場合", () => {
    // renders empty message
    it("空メッセージを表示すること", () => {
      const { container } = render(<SessionList {...defaultProps} sessions={[]} />);
      expect(container.querySelector(".item")).not.toBeInTheDocument();
    });
  });
});

describe("formatRelativeTime", () => {
  // when timestamp is less than 60 seconds ago
  context("60秒未満前の場合", () => {
    // returns "now" in English
    it('英語で "now" を返すこと', () => {
      expect(formatRelativeTime(Date.now() - 30_000, en)).toBe("now");
    });

    // returns "今" in Japanese
    it('日本語で "今" を返すこと', () => {
      expect(formatRelativeTime(Date.now() - 30_000, ja)).toBe("今");
    });
  });

  // when timestamp is minutes ago
  context("数分前の場合", () => {
    // returns minutes in English format
    it('英語で "5m" 形式を返すこと', () => {
      expect(formatRelativeTime(Date.now() - 5 * 60_000, en)).toBe("5m");
    });

    // returns minutes in Japanese format
    it('日本語で "5分" 形式を返すこと', () => {
      expect(formatRelativeTime(Date.now() - 5 * 60_000, ja)).toBe("5分");
    });
  });

  // when timestamp is hours ago
  context("数時間前の場合", () => {
    // returns hours in English format
    it('英語で "3h" 形式を返すこと', () => {
      expect(formatRelativeTime(Date.now() - 3 * 3_600_000, en)).toBe("3h");
    });

    // returns hours in Japanese format
    it('日本語で "3時間" 形式を返すこと', () => {
      expect(formatRelativeTime(Date.now() - 3 * 3_600_000, ja)).toBe("3時間");
    });
  });

  // when timestamp is days ago
  context("数日前の場合", () => {
    // returns days in English format
    it('英語で "2d" 形式を返すこと', () => {
      expect(formatRelativeTime(Date.now() - 2 * 86_400_000, en)).toBe("2d");
    });

    // returns days in Japanese format
    it('日本語で "2日" 形式を返すこと', () => {
      expect(formatRelativeTime(Date.now() - 2 * 86_400_000, ja)).toBe("2日");
    });
  });
});
