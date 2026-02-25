import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextPartView } from "../../../components/molecules/TextPartView";
import { createTextPart } from "../../factories";

describe("TextPartView", () => {
  // when rendered with a text part
  context("テキストパートを渡した場合", () => {
    // renders HTML content
    it("HTML コンテンツをレンダリングすること", () => {
      const part = createTextPart("Hello world");
      const { container } = render(<TextPartView part={part} />);
      expect(container.querySelector("span")).toBeInTheDocument();
    });

    // renders the text
    it("テキストを表示すること", () => {
      const part = createTextPart("Hello world");
      const { container } = render(<TextPartView part={part} />);
      expect(container.textContent).toContain("Hello world");
    });
  });

  // when text changes
  context("テキストが異なる場合", () => {
    // renders updated text
    it("更新されたテキストを表示すること", () => {
      const part = createTextPart("Updated text");
      const { container } = render(<TextPartView part={part} />);
      expect(container.textContent).toContain("Updated text");
    });
  });
});
