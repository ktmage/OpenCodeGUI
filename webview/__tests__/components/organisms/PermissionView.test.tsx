import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PermissionView } from "../../../components/organisms/PermissionView";
import { createPermission } from "../../factories";
import { postMessage } from "../../../vscode-api";

describe("PermissionView", () => {
  const defaultProps = {
    permission: createPermission({ title: "Allow file write?" }),
    activeSessionId: "session-1",
  };

  // when rendered
  context("レンダリングした場合", () => {
    // renders the permission title
    it("パーミッションタイトルを表示すること", () => {
      const { container } = render(<PermissionView {...defaultProps} />);
      expect(container.querySelector(".title")?.textContent).toBe("Allow file write?");
    });

    // renders three action buttons
    it("3 つのアクションボタンをレンダリングすること", () => {
      const { container } = render(<PermissionView {...defaultProps} />);
      expect(container.querySelectorAll(".actions button")).toHaveLength(3);
    });
  });

  // when Allow button is clicked
  context("Allow ボタンをクリックした場合", () => {
    // sends always response
    it("always レスポンスを送信すること", () => {
      const { container } = render(<PermissionView {...defaultProps} />);
      const buttons = container.querySelectorAll(".actions button");
      fireEvent.click(buttons[0]!);
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "replyPermission", response: "always" }),
      );
    });
  });

  // when Once button is clicked
  context("Once ボタンをクリックした場合", () => {
    // sends once response
    it("once レスポンスを送信すること", () => {
      const { container } = render(<PermissionView {...defaultProps} />);
      const buttons = container.querySelectorAll(".actions button");
      fireEvent.click(buttons[1]!);
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "replyPermission", response: "once" }),
      );
    });
  });

  // when Deny button is clicked
  context("Deny ボタンをクリックした場合", () => {
    // sends reject response
    it("reject レスポンスを送信すること", () => {
      const { container } = render(<PermissionView {...defaultProps} />);
      const buttons = container.querySelectorAll(".actions button");
      fireEvent.click(buttons[2]!);
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({ type: "replyPermission", response: "reject" }),
      );
    });
  });
});
