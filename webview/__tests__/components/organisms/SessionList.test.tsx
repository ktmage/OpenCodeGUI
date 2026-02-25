import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionList } from "../../../components/organisms/SessionList";
import { createSession } from "../../factories";

const sessions = [
  createSession({ id: "s1", title: "Session 1" }),
  createSession({ id: "s2", title: "Session 2" }),
];

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
      expect(container.querySelectorAll(".session-item")).toHaveLength(2);
    });

    // highlights the active session
    it("アクティブセッションをハイライトすること", () => {
      const { container } = render(<SessionList {...defaultProps} />);
      expect(container.querySelector(".session-item.active")).toBeInTheDocument();
    });
  });

  // when a session is clicked
  context("セッションをクリックした場合", () => {
    // calls onSelect
    it("onSelect が呼ばれること", () => {
      const onSelect = vi.fn();
      const { container } = render(<SessionList {...defaultProps} onSelect={onSelect} />);
      fireEvent.click(container.querySelectorAll(".session-item")[1]!);
      expect(onSelect).toHaveBeenCalledWith("s2");
    });
  });

  // when delete button is clicked
  context("削除ボタンをクリックした場合", () => {
    // calls onDelete
    it("onDelete が呼ばれること", () => {
      const onDelete = vi.fn();
      const { container } = render(<SessionList {...defaultProps} onDelete={onDelete} />);
      fireEvent.click(container.querySelector(".session-item-delete")!);
      expect(onDelete).toHaveBeenCalledWith("s1");
    });
  });

  // when there are no sessions
  context("セッションがない場合", () => {
    // renders empty message
    it("空メッセージを表示すること", () => {
      const { container } = render(<SessionList {...defaultProps} sessions={[]} />);
      expect(container.querySelector(".session-item")).not.toBeInTheDocument();
    });
  });
});
