import type { Event, Permission } from "@opencode-ai/sdk";
import { useCallback, useState } from "react";

/**
 * ツール実行時の許可リクエスト（Allow / Once / Deny）の状態管理フック。
 *
 * AI がツールを使おうとすると permission.updated で許可リクエストが届き、
 * ユーザーが回答すると permission.replied で解消される。
 * Map が空でなければ未回答のリクエストがあり、PermissionView が表示される。
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState<Map<string, Permission>>(new Map());

  const addPermission = useCallback((permission: Permission) => {
    setPermissions((prev) => {
      const next = new Map(prev);
      next.set(permission.id, permission);
      return next;
    });
  }, []);

  const removePermission = useCallback((permissionID: string) => {
    setPermissions((prev) => {
      const next = new Map(prev);
      next.delete(permissionID);
      return next;
    });
  }, []);

  const handlePermissionEvent = useCallback((event: Event) => {
    switch (event.type) {
      case "permission.updated":
        addPermission(event.properties);
        break;
      case "permission.replied":
        removePermission(event.properties.permissionID);
        break;
    }
  }, [addPermission, removePermission]);

  return {
    permissions,
    handlePermissionEvent,
  } as const;
}
