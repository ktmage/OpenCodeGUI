import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatusItem } from "../../../components/atoms/StatusItem";

describe("StatusItem", () => {
  // when rendered with basic props
  context("基本のプロパティで描画した場合", () => {
    // renders the indicator
    it("インジケータを表示すること", () => {
      const { container } = render(<StatusItem indicator="○" content="Task A" />);
      expect(container.querySelector(".status-item-indicator")?.textContent).toBe("○");
    });

    // renders the content
    it("コンテンツを表示すること", () => {
      const { container } = render(<StatusItem indicator="○" content="Task A" />);
      expect(container.querySelector(".status-item-content")?.textContent).toBe("Task A");
    });

    // does not have the done class
    it("done クラスを持たないこと", () => {
      const { container } = render(<StatusItem indicator="○" content="Task A" />);
      expect(container.querySelector(".status-item")?.classList.contains("done")).toBe(false);
    });
  });

  // when isDone is true
  context("isDone が true の場合", () => {
    // has the done class
    it("done クラスを持つこと", () => {
      const { container } = render(<StatusItem indicator="✓" content="Done" isDone />);
      expect(container.querySelector(".status-item")?.classList.contains("done")).toBe(true);
    });
  });

  // when badge is provided with danger variant
  context("badge が danger バリアントで指定された場合", () => {
    // renders the badge label
    it("バッジラベルを表示すること", () => {
      const { container } = render(
        <StatusItem indicator="○" content="Urgent" badge={{ label: "high", variant: "danger" }} />,
      );
      expect(container.querySelector(".status-item-badge")?.textContent).toBe("high");
    });

    // has the danger class on the badge
    it("バッジに danger クラスを持つこと", () => {
      const { container } = render(
        <StatusItem indicator="○" content="Urgent" badge={{ label: "high", variant: "danger" }} />,
      );
      expect(container.querySelector(".status-item-badge")?.classList.contains("danger")).toBe(true);
    });
  });

  // when badge is provided with muted variant
  context("badge が muted バリアントで指定された場合", () => {
    // has the muted class on the badge
    it("バッジに muted クラスを持つこと", () => {
      const { container } = render(
        <StatusItem indicator="○" content="Later" badge={{ label: "low", variant: "muted" }} />,
      );
      expect(container.querySelector(".status-item-badge")?.classList.contains("muted")).toBe(true);
    });
  });

  // when no badge is set
  context("badge が未設定の場合", () => {
    // does not render badge element
    it("バッジ要素を表示しないこと", () => {
      const { container } = render(<StatusItem indicator="○" content="Task" />);
      expect(container.querySelector(".status-item-badge")).toBeNull();
    });
  });

  // when className is provided
  context("className が指定された場合", () => {
    // applies the custom class
    it("カスタムクラスが付与されること", () => {
      const { container } = render(<StatusItem indicator="○" content="Task" className="custom" />);
      expect(container.querySelector(".status-item")?.classList.contains("custom")).toBe(true);
    });
  });
});
