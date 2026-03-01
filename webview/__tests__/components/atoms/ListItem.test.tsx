import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ListItem } from "../../../components/atoms/ListItem";

describe("ListItem", () => {
  // when rendered with defaults
  context("デフォルトの描画の場合", () => {
    // renders the title
    it("タイトルを表示すること", () => {
      const { container } = render(<ListItem title="index.ts" />);
      expect(container.querySelector(".title")?.textContent).toBe("index.ts");
    });

    // has the root class
    it("root クラスを持つこと", () => {
      const { container } = render(<ListItem title="index.ts" />);
      expect(container.querySelector(".root")).toBeInTheDocument();
    });
  });

  // when description is provided
  context("description が指定された場合", () => {
    // renders the description
    it("説明テキストを表示すること", () => {
      const { container } = render(<ListItem title="index.ts" description="/src/index.ts" />);
      expect(container.querySelector(".description")?.textContent).toBe("/src/index.ts");
    });
  });

  // when description is omitted
  context("description が未指定の場合", () => {
    // does not render description element
    it("description 要素を表示しないこと", () => {
      const { container } = render(<ListItem title="index.ts" />);
      expect(container.querySelector(".description")).toBeNull();
    });
  });

  // when clicked
  context("クリックした場合", () => {
    // calls onClick
    it("onClick が呼ばれること", () => {
      const onClick = vi.fn();
      const { container } = render(<ListItem title="index.ts" onClick={onClick} />);
      fireEvent.click(container.querySelector(".root")!);
      expect(onClick).toHaveBeenCalledOnce();
    });
  });

  // when className is provided
  context("className が指定された場合", () => {
    // applies the custom class
    it("カスタムクラスが付与されること", () => {
      const { container } = render(<ListItem title="index.ts" className="custom" />);
      expect(container.querySelector(".root")?.classList.contains("custom")).toBe(true);
    });
  });

  // when focused is true
  context("focused が true の場合", () => {
    // has data-focused attribute
    it("data-focused 属性を持つこと", () => {
      const { container } = render(<ListItem title="index.ts" focused={true} />);
      expect(container.querySelector(".root")?.getAttribute("data-focused")).toBe("true");
    });
  });

  // when focused is false or undefined
  context("focused が false または未指定の場合", () => {
    // does not have data-focused attribute
    it("data-focused 属性を持たないこと", () => {
      const { container } = render(<ListItem title="index.ts" focused={false} />);
      expect(container.querySelector(".root")?.hasAttribute("data-focused")).toBe(false);
    });
  });
});
