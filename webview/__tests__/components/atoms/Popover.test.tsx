import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Popover } from "../../../components/atoms/Popover";

describe("Popover", () => {
  const defaultProps = {
    trigger: ({ open, toggle }: { open: boolean; toggle: () => void }) => (
      <button type="button" onClick={toggle} data-testid="trigger">
        {open ? "open" : "closed"}
      </button>
    ),
    panel: ({ close }: { close: () => void }) => (
      <div data-testid="panel">
        <button type="button" onClick={close} data-testid="close-btn">
          close
        </button>
      </div>
    ),
  };

  // renders trigger
  context("初期描画の場合", () => {
    // renders trigger content
    it("トリガーが描画されること", () => {
      render(<Popover {...defaultProps} />);
      expect(screen.getByTestId("trigger")).toBeInTheDocument();
    });

    // does not render panel
    it("パネルが描画されないこと", () => {
      render(<Popover {...defaultProps} />);
      expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
    });

    // trigger receives open=false
    it("トリガーに open=false が渡されること", () => {
      render(<Popover {...defaultProps} />);
      expect(screen.getByTestId("trigger")).toHaveTextContent("closed");
    });

    // applies root class
    it("root クラスを持つこと", () => {
      const { container } = render(<Popover {...defaultProps} />);
      expect(container.firstElementChild).toHaveClass("root");
    });
  });

  // clicking trigger opens panel
  context("トリガーをクリックした場合", () => {
    // shows panel
    it("パネルが表示されること", () => {
      render(<Popover {...defaultProps} />);
      fireEvent.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("panel")).toBeInTheDocument();
    });

    // trigger receives open=true
    it("トリガーに open=true が渡されること", () => {
      render(<Popover {...defaultProps} />);
      fireEvent.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveTextContent("open");
    });
  });

  // toggle: clicking trigger again closes panel
  context("トリガーを2回クリックした場合", () => {
    // hides panel
    it("パネルが閉じること", () => {
      render(<Popover {...defaultProps} />);
      const trigger = screen.getByTestId("trigger");
      fireEvent.click(trigger);
      expect(screen.getByTestId("panel")).toBeInTheDocument();
      fireEvent.click(trigger);
      expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
    });
  });

  // close callback from panel
  context("パネル内の close を呼んだ場合", () => {
    // hides panel
    it("パネルが閉じること", () => {
      render(<Popover {...defaultProps} />);
      fireEvent.click(screen.getByTestId("trigger"));
      fireEvent.click(screen.getByTestId("close-btn"));
      expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
    });
  });

  // clicking outside closes panel
  context("外側をクリックした場合", () => {
    // hides panel
    it("パネルが閉じること", () => {
      render(
        <div>
          <Popover {...defaultProps} />
          <div data-testid="outside" />
        </div>,
      );
      fireEvent.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("panel")).toBeInTheDocument();
      fireEvent.mouseDown(screen.getByTestId("outside"));
      expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
    });
  });

  // clicking inside panel does not close it
  context("パネル内部をクリックした場合", () => {
    // keeps panel open
    it("パネルが開いたままであること", () => {
      render(<Popover {...defaultProps} />);
      fireEvent.click(screen.getByTestId("trigger"));
      fireEvent.mouseDown(screen.getByTestId("panel"));
      expect(screen.getByTestId("panel")).toBeInTheDocument();
    });
  });

  // className prop
  context("className を指定した場合", () => {
    // applies additional class
    it("追加クラスが適用されること", () => {
      const { container } = render(<Popover {...defaultProps} className="custom" />);
      expect(container.firstElementChild).toHaveClass("root", "custom");
    });
  });
});
