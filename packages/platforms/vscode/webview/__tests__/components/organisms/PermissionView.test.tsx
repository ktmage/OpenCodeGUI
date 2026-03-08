import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PermissionQueue, PermissionView } from "../../../components/organisms/PermissionView";
import { postMessage } from "../../../vscode-api";
import { createPermission } from "../../factories";

describe("PermissionView (PermissionItem)", () => {
  const permission = createPermission({
    permission: "external_directory",
    patterns: ["/tmp/foo"],
    sessionID: "child-session-1",
  });
  const defaultProps = { permission };

  // when rendered
  context("レンダリングした場合", () => {
    // renders the permission type
    it("パーミッションタイプを表示すること", () => {
      render(<PermissionView {...defaultProps} />);
      expect(screen.getByText("External Directory")).toBeDefined();
    });

    // renders patterns as detail
    it("パターンを表示すること", () => {
      render(<PermissionView {...defaultProps} />);
      expect(screen.getByText("/tmp/foo")).toBeDefined();
    });

    // renders three action buttons
    it("3 つのアクションボタンをレンダリングすること", () => {
      render(<PermissionView {...defaultProps} />);
      expect(screen.getByText("Allow")).toBeDefined();
      expect(screen.getByText("Once")).toBeDefined();
      expect(screen.getByText("Deny")).toBeDefined();
    });
  });

  // when rendered with empty patterns
  context("patterns が空の場合", () => {
    it("detail を表示しないこと", () => {
      const permNoPatterns = createPermission({ permission: "edit", patterns: [] });
      const { container } = render(<PermissionView permission={permNoPatterns} />);
      expect(container.querySelectorAll("[class*='itemDetail']")).toHaveLength(0);
    });
  });

  // when Allow button is clicked
  context("Allow ボタンをクリックした場合", () => {
    it("permission.sessionID を使って always レスポンスを送信すること", () => {
      render(<PermissionView {...defaultProps} />);
      fireEvent.click(screen.getByText("Allow"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "replyPermission",
        sessionId: "child-session-1",
        permissionId: permission.id,
        response: "always",
      });
    });
  });

  // when Once button is clicked
  context("Once ボタンをクリックした場合", () => {
    it("permission.sessionID を使って once レスポンスを送信すること", () => {
      render(<PermissionView {...defaultProps} />);
      fireEvent.click(screen.getByText("Once"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "replyPermission",
        sessionId: "child-session-1",
        permissionId: permission.id,
        response: "once",
      });
    });
  });

  // when Deny button is clicked
  context("Deny ボタンをクリックした場合", () => {
    it("permission.sessionID を使って reject レスポンスを送信すること", () => {
      render(<PermissionView {...defaultProps} />);
      fireEvent.click(screen.getByText("Deny"));
      expect(postMessage).toHaveBeenCalledWith({
        type: "replyPermission",
        sessionId: "child-session-1",
        permissionId: permission.id,
        response: "reject",
      });
    });
  });
});

describe("PermissionQueue", () => {
  // when no permissions
  context("パーミッションがない場合", () => {
    it("何もレンダリングしないこと", () => {
      const { container } = render(<PermissionQueue permissions={new Map()} />);
      expect(container.innerHTML).toBe("");
    });
  });

  // when one permission
  context("パーミッションが 1 件の場合", () => {
    it("ヘッダーバーと 1 件のパーミッションを表示すること", () => {
      const perm = createPermission({ permission: "bash", patterns: ["echo hello"] });
      const map = new Map([[perm.id, perm]]);
      render(<PermissionQueue permissions={map} />);

      // ヘッダーバー
      expect(screen.getByText("Permissions")).toBeDefined();
      expect(screen.getByText("1")).toBeDefined();

      // パーミッションアイテム
      expect(screen.getByText("Bash")).toBeDefined();
      expect(screen.getByText("echo hello")).toBeDefined();
    });

    it("展開シェブロンを表示しないこと", () => {
      const perm = createPermission({ permission: "bash", patterns: ["echo hello"] });
      const map = new Map([[perm.id, perm]]);
      const { container } = render(<PermissionQueue permissions={map} />);
      expect(container.querySelectorAll("[class*='chevron']")).toHaveLength(0);
    });
  });

  // when multiple permissions
  context("パーミッションが複数件の場合", () => {
    const perm1 = createPermission({ id: "p1", permission: "bash", patterns: ["ls"] });
    const perm2 = createPermission({ id: "p2", permission: "edit", patterns: ["file.ts"] });
    const perm3 = createPermission({ id: "p3", permission: "external_directory", patterns: ["/tmp"] });
    const map = new Map([
      [perm1.id, perm1],
      [perm2.id, perm2],
      [perm3.id, perm3],
    ]);

    it("ヘッダーバーにカウントを表示すること", () => {
      render(<PermissionQueue permissions={map} />);
      expect(screen.getByText("3")).toBeDefined();
    });

    it("先頭のパーミッションを常に表示すること", () => {
      render(<PermissionQueue permissions={map} />);
      expect(screen.getByText("Bash")).toBeDefined();
      expect(screen.getByText("ls")).toBeDefined();
    });

    it("残りのパーミッションはデフォルトで非表示であること", () => {
      render(<PermissionQueue permissions={map} />);
      expect(screen.queryByText("file.ts")).toBeNull();
      expect(screen.queryByText("/tmp")).toBeNull();
    });

    it("ヘッダーバーをクリックすると残りが展開されること", () => {
      render(<PermissionQueue permissions={map} />);
      const header = screen.getByText("Permissions").closest("[class*='bar']")!;
      fireEvent.click(header);
      expect(screen.getByText("file.ts")).toBeDefined();
      expect(screen.getByText("/tmp")).toBeDefined();
    });
  });
});
