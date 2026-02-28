import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionButton } from "../../../components/atoms/ActionButton";

describe("ActionButton", () => {
  // renders a button element
  context("デフォルトの描画の場合", () => {
    // renders a <button> element with type="button"
    it('<button type="button"> をレンダリングすること', () => {
      render(<ActionButton>OK</ActionButton>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("type", "button");
    });

    // applies root class
    it("root クラスを持つこと", () => {
      render(<ActionButton>OK</ActionButton>);
      expect(screen.getByRole("button")).toHaveClass("root");
    });

    // does not apply variant or size modifier classes
    it("variant / size 修飾クラスを持たないこと", () => {
      render(<ActionButton>OK</ActionButton>);
      expect(screen.getByRole("button").className).toBe("root");
    });

    // renders children
    it("children を描画すること", () => {
      render(<ActionButton>Click me</ActionButton>);
      expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });
  });

  // variant="secondary"
  context('variant="secondary" の場合', () => {
    // applies secondary class
    it("secondary クラスを持つこと", () => {
      render(<ActionButton variant="secondary">X</ActionButton>);
      expect(screen.getByRole("button")).toHaveClass("root", "secondary");
    });
  });

  // variant="ghost"
  context('variant="ghost" の場合', () => {
    // applies ghost class
    it("ghost クラスを持つこと", () => {
      render(<ActionButton variant="ghost">X</ActionButton>);
      expect(screen.getByRole("button")).toHaveClass("root", "ghost");
    });
  });

  // size="sm"
  context('size="sm" の場合', () => {
    // applies sm class
    it("sm クラスを持つこと", () => {
      render(<ActionButton size="sm">X</ActionButton>);
      expect(screen.getByRole("button")).toHaveClass("root", "sm");
    });
  });

  // combined variant + size + className
  context("variant, size, className をすべて指定した場合", () => {
    // applies all classes
    it("すべてのクラスが結合されること", () => {
      render(
        <ActionButton variant="ghost" size="sm" className="custom">
          X
        </ActionButton>,
      );
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("root", "ghost", "sm", "custom");
    });
  });

  // onClick handler
  context("クリックした場合", () => {
    // fires onClick handler
    it("onClick が呼ばれること", () => {
      const onClick = vi.fn();
      render(<ActionButton onClick={onClick}>X</ActionButton>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // disabled state
  context("disabled の場合", () => {
    // renders disabled attribute
    it("disabled 属性を持つこと", () => {
      render(<ActionButton disabled>X</ActionButton>);
      expect(screen.getByRole("button")).toBeDisabled();
    });

    // does not fire onClick when disabled
    it("クリックしても onClick が呼ばれないこと", () => {
      const onClick = vi.fn();
      render(
        <ActionButton disabled onClick={onClick}>
          X
        </ActionButton>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
