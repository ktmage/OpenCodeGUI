import type { Event } from "@opencode-ai/sdk";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { usePermissions } from "../../hooks/usePermissions";

describe("usePermissions", () => {
  // initial state
  context("初期状態の場合", () => {
    // permissions is empty
    it("permissions が空の Map であること", () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.permissions.size).toBe(0);
    });
  });

  // permission.updated
  context("permission.updated イベントを受信した場合", () => {
    // adds permission to the map
    it("permissions に追加されること", () => {
      const { result } = renderHook(() => usePermissions());
      const event = {
        type: "permission.updated",
        properties: { id: "perm1", title: "allow bash" },
      } as unknown as Event;
      act(() => result.current.handlePermissionEvent(event));
      expect(result.current.permissions.has("perm1")).toBe(true);
    });

    // stores the permission data
    it("permission のデータが保持されること", () => {
      const { result } = renderHook(() => usePermissions());
      const permission = { id: "perm1", title: "allow bash" };
      const event = { type: "permission.updated", properties: permission } as unknown as Event;
      act(() => result.current.handlePermissionEvent(event));
      expect(result.current.permissions.get("perm1")).toEqual(permission);
    });
  });

  // permission.replied
  context("permission.replied イベントを受信した場合", () => {
    // removes permission from the map
    it("permissions から削除されること", () => {
      const { result } = renderHook(() => usePermissions());
      // first add
      const addEvent = {
        type: "permission.updated",
        properties: { id: "perm1", title: "allow bash" },
      } as unknown as Event;
      act(() => result.current.handlePermissionEvent(addEvent));
      // then reply
      const replyEvent = {
        type: "permission.replied",
        properties: { permissionID: "perm1" },
      } as unknown as Event;
      act(() => result.current.handlePermissionEvent(replyEvent));
      expect(result.current.permissions.has("perm1")).toBe(false);
    });
  });

  // unrelated events
  context("無関係なイベントを受信した場合", () => {
    // does not change permissions
    it("permissions が変わらないこと", () => {
      const { result } = renderHook(() => usePermissions());
      const event = {
        type: "session.updated",
        properties: { id: "session1" },
      } as unknown as Event;
      act(() => result.current.handlePermissionEvent(event));
      expect(result.current.permissions.size).toBe(0);
    });
  });
});
