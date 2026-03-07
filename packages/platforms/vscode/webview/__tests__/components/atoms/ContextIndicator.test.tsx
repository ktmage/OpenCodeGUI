import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContextIndicator, formatTokenCount } from "../../../components/atoms/ContextIndicator";

describe("formatTokenCount", () => {
  // when value is less than 1000
  context("1000 未満の場合", () => {
    // returns the number as-is
    it("数値をそのまま文字列で返すこと", () => {
      expect(formatTokenCount(500)).toBe("500");
    });
  });

  // when value is in thousands
  context("1000 以上 100 万未満の場合", () => {
    // returns K notation
    it("K 表記で返すこと", () => {
      expect(formatTokenCount(1500)).toBe("1.5K");
    });
  });

  // when value is in millions
  context("100 万以上の場合", () => {
    // returns M notation
    it("M 表記で返すこと", () => {
      expect(formatTokenCount(2_500_000)).toBe("2.5M");
    });
  });
});

describe("ContextIndicator", () => {
  const defaultProps = {
    inputTokens: 5000,
    contextLimit: 10000,
    onCompress: vi.fn(),
    isCompressing: false,
  };

  // when contextLimit is 0 or less
  context("contextLimit が 0 以下の場合", () => {
    // renders nothing
    it("何もレンダリングしないこと", () => {
      const { container } = render(<ContextIndicator {...defaultProps} contextLimit={0} />);
      expect(container.innerHTML).toBe("");
    });
  });

  // when usage is 0%
  context("使用率が 0% の場合", () => {
    // renders nothing
    it("何もレンダリングしないこと", () => {
      const { container } = render(<ContextIndicator {...defaultProps} inputTokens={0} />);
      expect(container.innerHTML).toBe("");
    });
  });

  // when usage is above 0%
  context("使用率が 0% より大きい場合", () => {
    // renders an SVG progress ring
    it("SVG プログレスリングをレンダリングすること", () => {
      const { container } = render(<ContextIndicator {...defaultProps} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    // renders the indicator button
    it("インジケーターボタンをレンダリングすること", () => {
      const { container } = render(<ContextIndicator {...defaultProps} />);
      expect(container.querySelector(".button")).toBeInTheDocument();
    });
  });

  // when the button is clicked
  context("ボタンをクリックした場合", () => {
    // shows the popup
    it("ポップアップを表示すること", () => {
      const { container } = render(<ContextIndicator {...defaultProps} />);
      fireEvent.click(container.querySelector(".button")!);
      expect(container.querySelector(".popup")).toBeInTheDocument();
    });
  });

  // when compress button is clicked in the popup
  context("ポップアップ内の圧縮ボタンをクリックした場合", () => {
    // calls onCompress
    it("onCompress が呼ばれること", () => {
      const onCompress = vi.fn();
      const { container } = render(<ContextIndicator {...defaultProps} onCompress={onCompress} />);
      fireEvent.click(container.querySelector(".button")!);
      fireEvent.click(container.querySelector(".compressButton")!);
      expect(onCompress).toHaveBeenCalledOnce();
    });
  });

  // when isCompressing is true
  context("isCompressing が true の場合", () => {
    // disables the compress button
    it("圧縮ボタンが無効化されること", () => {
      const { container } = render(<ContextIndicator {...defaultProps} isCompressing={true} />);
      fireEvent.click(container.querySelector(".button")!);
      expect(container.querySelector(".compressButton")).toBeDisabled();
    });
  });
});
