import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IconButton } from "../../../components/atoms/IconButton";

describe("IconButton", () => {
  // renders a button element
  context("デフォルトの描画の場合", () => {
    // renders a <button> element with type="button"
    it('<button type="button"> をレンダリングすること', () => {
      render(<IconButton>X</IconButton>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("type", "button");
    });

    // applies icon-button class
    it("icon-button クラスを持つこと", () => {
      render(<IconButton>X</IconButton>);
      expect(screen.getByRole("button")).toHaveClass("icon-button");
    });

    // does not apply variant or size modifier classes
    it("variant / size 修飾クラスを持たないこと", () => {
      render(<IconButton>X</IconButton>);
      const btn = screen.getByRole("button");
      expect(btn.className).toBe("icon-button");
    });

    // renders children
    it("children を描画すること", () => {
      render(<IconButton>ICON</IconButton>);
      expect(screen.getByRole("button")).toHaveTextContent("ICON");
    });
  });

  // variant="muted"
  context('variant="muted" の場合', () => {
    // applies icon-button--muted class
    it("icon-button--muted クラスを持つこと", () => {
      render(<IconButton variant="muted">X</IconButton>);
      expect(screen.getByRole("button")).toHaveClass("icon-button", "icon-button--muted");
    });
  });

  // variant="outlined"
  context('variant="outlined" の場合', () => {
    // applies icon-button--outlined class
    it("icon-button--outlined クラスを持つこと", () => {
      render(<IconButton variant="outlined">X</IconButton>);
      expect(screen.getByRole("button")).toHaveClass("icon-button", "icon-button--outlined");
    });
  });

  // size="sm"
  context('size="sm" の場合', () => {
    // applies icon-button--sm class
    it("icon-button--sm クラスを持つこと", () => {
      render(<IconButton size="sm">X</IconButton>);
      expect(screen.getByRole("button")).toHaveClass("icon-button", "icon-button--sm");
    });
  });

  // combined variant + size + className
  context("variant, size, className をすべて指定した場合", () => {
    // applies all classes
    it("すべてのクラスが結合されること", () => {
      render(
        <IconButton variant="muted" size="sm" className="custom">
          X
        </IconButton>,
      );
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("icon-button", "icon-button--muted", "icon-button--sm", "custom");
    });
  });

  // onClick handler
  context("クリックした場合", () => {
    // fires onClick handler
    it("onClick が呼ばれること", () => {
      const onClick = vi.fn();
      render(<IconButton onClick={onClick}>X</IconButton>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // disabled state
  context("disabled の場合", () => {
    // renders disabled attribute
    it("disabled 属性を持つこと", () => {
      render(<IconButton disabled>X</IconButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    // does not fire onClick when disabled
    it("クリックしても onClick が呼ばれないこと", () => {
      const onClick = vi.fn();
      render(
        <IconButton disabled onClick={onClick}>
          X
        </IconButton>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // title attribute
  context("title を指定した場合", () => {
    // passes title attribute
    it("title 属性が設定されること", () => {
      render(<IconButton title="my-title">X</IconButton>);
      expect(screen.getByRole("button")).toHaveAttribute("title", "my-title");
    });
  });
});
