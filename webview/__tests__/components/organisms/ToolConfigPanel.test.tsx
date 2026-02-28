import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolConfigPanel } from "../../../components/organisms/ToolConfigPanel";

const defaultProps = {
  paths: { home: "/home", config: "/config", state: "/state", directory: "/project" },
  onOpenConfigFile: vi.fn(),
  onClose: vi.fn(),
  localeSetting: "auto" as const,
  onLocaleSettingChange: vi.fn(),
};

describe("ToolConfigPanel", () => {
  // when rendered
  context("レンダリングした場合", () => {
    // renders the panel
    it("パネルをレンダリングすること", () => {
      const { container } = render(<ToolConfigPanel {...defaultProps} />);
      expect(container.querySelector(".root")).toBeInTheDocument();
    });

    // renders close button
    it("閉じるボタンをレンダリングすること", () => {
      const { container } = render(<ToolConfigPanel {...defaultProps} />);
      expect(container.querySelector(".muted.sm")).toBeInTheDocument();
    });

    // renders language options
    it("言語オプションをレンダリングすること", () => {
      const { container } = render(<ToolConfigPanel {...defaultProps} />);
      expect(container.querySelectorAll("input[name='locale']")).toHaveLength(3);
    });
  });

  // when paths are provided
  context("paths が提供されている場合", () => {
    // renders config file links
    it("設定ファイルリンクをレンダリングすること", () => {
      const { container } = render(<ToolConfigPanel {...defaultProps} />);
      expect(container.querySelectorAll(".footer button")).toHaveLength(2);
    });
  });

  // when paths are null
  context("paths が null の場合", () => {
    // does not render config file links
    it("設定ファイルリンクをレンダリングしないこと", () => {
      const { container } = render(<ToolConfigPanel {...defaultProps} paths={null} />);
      expect(container.querySelector(".footer")).not.toBeInTheDocument();
    });
  });
});
