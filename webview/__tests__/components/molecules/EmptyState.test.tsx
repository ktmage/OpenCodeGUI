import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "../../../components/molecules/EmptyState";

describe("EmptyState", () => {
  // when rendered
  context("レンダリングした場合", () => {
    // renders the title
    it("タイトルを表示すること", () => {
      const { container } = render(<EmptyState onNewSession={vi.fn()} />);
      expect(container.querySelector(".title")).toBeInTheDocument();
    });

    // renders the description
    it("説明文を表示すること", () => {
      const { container } = render(<EmptyState onNewSession={vi.fn()} />);
      expect(container.querySelector(".description")).toBeInTheDocument();
    });

    // renders the new chat button
    it("新規チャットボタンを表示すること", () => {
      const { container } = render(<EmptyState onNewSession={vi.fn()} />);
      expect(container.querySelector("button")).toBeInTheDocument();
    });
  });

  // when new chat button is clicked
  context("新規チャットボタンをクリックした場合", () => {
    // calls onNewSession
    it("onNewSession が呼ばれること", () => {
      const onNewSession = vi.fn();
      const { container } = render(<EmptyState onNewSession={onNewSession} />);
      fireEvent.click(container.querySelector("button")!);
      expect(onNewSession).toHaveBeenCalledOnce();
    });
  });
});
