import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DiffView } from "../../../components/molecules/DiffView";

describe("DiffView", () => {
  // when there are additions and removals
  context("追加行と削除行がある場合", () => {
    // renders add count
    it("追加行数を表示すること", () => {
      const { container } = render(<DiffView oldStr="hello" newStr="world" />);
      expect(container.querySelector(".statAdd")).toBeInTheDocument();
    });

    // renders remove count
    it("削除行数を表示すること", () => {
      const { container } = render(<DiffView oldStr="hello" newStr="world" />);
      expect(container.querySelector(".statRemove")).toBeInTheDocument();
    });

    // renders diff lines
    it("差分行をレンダリングすること", () => {
      const { container } = render(<DiffView oldStr="hello" newStr="world" />);
      expect(container.querySelectorAll(".line").length).toBeGreaterThan(0);
    });
  });

  // when strings are identical
  context("文字列が同一の場合", () => {
    // does not show add stat
    it("追加行数を表示しないこと", () => {
      const { container } = render(<DiffView oldStr="same" newStr="same" />);
      expect(container.querySelector(".statAdd")).not.toBeInTheDocument();
    });

    // does not show remove stat
    it("削除行数を表示しないこと", () => {
      const { container } = render(<DiffView oldStr="same" newStr="same" />);
      expect(container.querySelector(".statRemove")).not.toBeInTheDocument();
    });
  });

  // when only additions exist
  context("追加行のみの場合", () => {
    // renders add stat
    it("追加行数のみを表示すること", () => {
      const { container } = render(<DiffView oldStr="" newStr="new line" />);
      expect(container.querySelector(".statAdd")).toBeInTheDocument();
    });
  });
});
