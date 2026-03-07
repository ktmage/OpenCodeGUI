import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LinkButton } from "../../../components/atoms/LinkButton";

describe("LinkButton", () => {
  // renders a button element
  context("デフォルトの描画の場合", () => {
    // renders a <button> element with type="button"
    it('<button type="button"> をレンダリングすること', () => {
      render(<LinkButton>Link</LinkButton>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveAttribute("type", "button");
    });

    // applies root class
    it("root クラスを持つこと", () => {
      render(<LinkButton>Link</LinkButton>);
      expect(screen.getByRole("button")).toHaveClass("root");
    });

    // renders children
    it("children を描画すること", () => {
      render(<LinkButton>Open File</LinkButton>);
      expect(screen.getByRole("button")).toHaveTextContent("Open File");
    });
  });

  // className prop
  context("className を指定した場合", () => {
    // merges custom className
    it("カスタムクラスが結合されること", () => {
      render(<LinkButton className="custom">Link</LinkButton>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass("root", "custom");
    });
  });

  // onClick handler
  context("クリックした場合", () => {
    // fires onClick handler
    it("onClick が呼ばれること", () => {
      const onClick = vi.fn();
      render(<LinkButton onClick={onClick}>Link</LinkButton>);
      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // title attribute
  context("title を指定した場合", () => {
    // passes title attribute
    it("title 属性が設定されること", () => {
      render(<LinkButton title="my-title">Link</LinkButton>);
      expect(screen.getByRole("button")).toHaveAttribute("title", "my-title");
    });
  });
});
