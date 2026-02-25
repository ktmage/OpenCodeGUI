import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileCreateView } from "../../../components/molecules/FileCreateView";

describe("FileCreateView", () => {
  // when content has a few lines
  context("少数行のコンテンツの場合", () => {
    // renders all lines as add lines
    it("すべての行を追加行として表示すること", () => {
      const content = "line1\nline2\nline3";
      const { container } = render(<FileCreateView content={content} />);
      expect(container.querySelectorAll(".tool-diff-line-add")).toHaveLength(3);
    });

    // shows add lines count in stats
    it("追加行数を stats に表示すること", () => {
      const content = "line1\nline2";
      const { container } = render(<FileCreateView content={content} />);
      expect(container.querySelector(".tool-diff-stat-add")).toBeInTheDocument();
    });
  });

  // when content exceeds 30 lines
  context("コンテンツが 30 行を超える場合", () => {
    // truncates to 31 display lines (30 + more indicator)
    it("表示行を 31 行に切り詰めること", () => {
      const lines = Array.from({ length: 50 }, (_, i) => `line${i + 1}`);
      const content = lines.join("\n");
      const { container } = render(<FileCreateView content={content} />);
      expect(container.querySelectorAll(".tool-diff-line-add")).toHaveLength(31);
    });
  });
});
