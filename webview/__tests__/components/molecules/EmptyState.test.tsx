import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "../../../components/molecules/EmptyState";

describe("EmptyState", () => {
  // when rendered
  context("レンダリングした場合", () => {
    // renders the title
    it("タイトルを表示すること", () => {
      const { container } = render(<EmptyState onNewSession={vi.fn()} />);
      expect(container.querySelector(".empty-state-title")).toBeInTheDocument();
    });

    // renders the description
    it("説明文を表示すること", () => {
      const { container } = render(<EmptyState onNewSession={vi.fn()} />);
      expect(container.querySelector(".empty-state-description")).toBeInTheDocument();
    });

    // renders the new chat button
    it("新規チャットボタンを表示すること", () => {
      const { container } = render(<EmptyState onNewSession={vi.fn()} />);
      expect(container.querySelector(".btn")).toBeInTheDocument();
    });
  });

  // when new chat button is clicked
  context("新規チャットボタンをクリックした場合", () => {
    // calls onNewSession
    it("onNewSession が呼ばれること", () => {
      const onNewSession = vi.fn();
      const { container } = render(<EmptyState onNewSession={onNewSession} />);
      fireEvent.click(container.querySelector(".btn")!);
      expect(onNewSession).toHaveBeenCalledOnce();
    });
  });
});
