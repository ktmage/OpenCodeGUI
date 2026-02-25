import type { FC } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { IconProps } from "../../../components/atoms/icons";
import {
  AddIcon,
  CheckboxIcon,
  ChevronRightIcon,
  ClipIcon,
  CloseIcon,
  DeleteIcon,
  EditActionIcon,
  EditIcon,
  ErrorCircleIcon,
  EyeIcon,
  EyeOffIcon,
  FileIcon,
  GearIcon,
  InfoCircleIcon,
  ListIcon,
  PlusIcon,
  ReadActionIcon,
  RevertIcon,
  RunActionIcon,
  SearchActionIcon,
  SendIcon,
  SpinnerIcon,
  StopIcon,
  TerminalIcon,
  ToolIcon,
  WriteActionIcon,
} from "../../../components/atoms/icons";

function describeIconComponent(Icon: FC<IconProps>, defaultW: number, defaultH: number) {
  // when rendered with default props
  context("デフォルトの描画の場合", () => {
    // renders an <svg> element
    it("<svg> 要素をレンダリングすること", () => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    // has aria-hidden attribute
    it("aria-hidden 属性を持つこと", () => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    });

    // has correct default width
    it(`デフォルトの幅が ${defaultW} であること`, () => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")!.getAttribute("width")).toBe(String(defaultW));
    });

    // has correct default height
    it(`デフォルトの高さが ${defaultH} であること`, () => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")!.getAttribute("height")).toBe(String(defaultH));
    });
  });

  // when custom props are passed
  context("カスタム props を指定した場合", () => {
    // accepts custom width
    it("カスタム width が反映されること", () => {
      const { container } = render(<Icon width={24} height={24} />);
      expect(container.querySelector("svg")!.getAttribute("width")).toBe("24");
    });

    // accepts custom height
    it("カスタム height が反映されること", () => {
      const { container } = render(<Icon width={24} height={24} />);
      expect(container.querySelector("svg")!.getAttribute("height")).toBe("24");
    });

    // passes className through
    it("className が SVG 要素に反映されること", () => {
      const { container } = render(<Icon className="custom-class" />);
      expect(container.querySelector("svg")).toHaveClass("custom-class");
    });

    // spreads arbitrary SVG attributes
    it("任意の SVG 属性がスプレッドされること", () => {
      const { container } = render(<Icon data-testid="icon" />);
      expect(container.querySelector("svg")).toHaveAttribute("data-testid", "icon");
    });
  });
}

describe("ListIcon", () => {
  describeIconComponent(ListIcon, 16, 16);
});

describe("AddIcon", () => {
  describeIconComponent(AddIcon, 16, 16);
});

describe("PlusIcon", () => {
  describeIconComponent(PlusIcon, 12, 12);
});

describe("ChevronRightIcon", () => {
  describeIconComponent(ChevronRightIcon, 12, 12);
});

describe("FileIcon", () => {
  describeIconComponent(FileIcon, 12, 12);
});

describe("ClipIcon", () => {
  describeIconComponent(ClipIcon, 14, 14);
});

describe("CloseIcon", () => {
  describeIconComponent(CloseIcon, 14, 14);
});

describe("DeleteIcon", () => {
  describeIconComponent(DeleteIcon, 14, 14);
});

describe("EditIcon", () => {
  describeIconComponent(EditIcon, 14, 14);
});

describe("SendIcon", () => {
  describeIconComponent(SendIcon, 16, 16);
});

describe("StopIcon", () => {
  describeIconComponent(StopIcon, 16, 16);
});

describe("RevertIcon", () => {
  describeIconComponent(RevertIcon, 12, 12);
});

describe("TerminalIcon", () => {
  describeIconComponent(TerminalIcon, 16, 16);
});

describe("GearIcon", () => {
  describeIconComponent(GearIcon, 16, 16);
});

describe("SpinnerIcon", () => {
  describeIconComponent(SpinnerIcon, 16, 16);

  context("SpinnerIcon 固有の描画の場合", () => {
    // uses fill='none' (stroke-based rendering)
    it("fill が 'none' であること（ストローク描画）", () => {
      const { container } = render(<SpinnerIcon />);
      expect(container.querySelector("svg")!.getAttribute("fill")).toBe("none");
    });

    // contains a circle element for the track
    it("トラック用の circle 要素を含むこと", () => {
      const { container } = render(<SpinnerIcon />);
      expect(container.querySelector("circle")).toBeInTheDocument();
    });

    // contains a path element for the spinner arc
    it("スピナーアーク用の path 要素を含むこと", () => {
      const { container } = render(<SpinnerIcon />);
      expect(container.querySelector("path")).toBeInTheDocument();
    });
  });
});

describe("ErrorCircleIcon", () => {
  describeIconComponent(ErrorCircleIcon, 16, 16);
});

describe("InfoCircleIcon", () => {
  describeIconComponent(InfoCircleIcon, 14, 14);
});

describe("CheckboxIcon", () => {
  describeIconComponent(CheckboxIcon, 14, 14);
});

describe("ReadActionIcon", () => {
  describeIconComponent(ReadActionIcon, 14, 14);
});

describe("EditActionIcon", () => {
  describeIconComponent(EditActionIcon, 14, 14);
});

describe("WriteActionIcon", () => {
  describeIconComponent(WriteActionIcon, 14, 14);
});

describe("RunActionIcon", () => {
  describeIconComponent(RunActionIcon, 14, 14);
});

describe("SearchActionIcon", () => {
  describeIconComponent(SearchActionIcon, 14, 14);
});

describe("ToolIcon", () => {
  describeIconComponent(ToolIcon, 14, 14);
});

describe("EyeIcon", () => {
  describeIconComponent(EyeIcon, 14, 14);
});

describe("EyeOffIcon", () => {
  describeIconComponent(EyeOffIcon, 14, 14);
});
