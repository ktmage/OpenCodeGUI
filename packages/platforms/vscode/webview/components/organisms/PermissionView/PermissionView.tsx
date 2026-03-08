import type { Permission } from "@opencodegui/core";
import { useState } from "react";
import { useLocale } from "../../../locales";
import { postMessage } from "../../../vscode-api";
import { ActionButton } from "../../atoms/ActionButton";
import { ChevronRightIcon, ShieldIcon } from "../../atoms/icons";
import styles from "./PermissionView.module.css";

/**
 * パーミッションの種類を人間が読みやすいラベルに変換する。
 */
function formatPermissionType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type ItemProps = {
  permission: Permission;
};

/**
 * 単一パーミッションの行表示。
 * 種別 + パターン + Allow / Once / Deny ボタンをコンパクトな1行に収める。
 */
function PermissionItem({ permission }: ItemProps) {
  const t = useLocale();

  const reply = (response: "once" | "always" | "reject") => {
    postMessage({
      type: "replyPermission",
      sessionId: permission.sessionID,
      permissionId: permission.id,
      response,
    });
  };

  const title = formatPermissionType(permission.permission);
  const detail = permission.patterns.length > 0 ? permission.patterns.join(", ") : undefined;

  return (
    <div className={styles.item}>
      <div className={styles.itemInfo}>
        <span className={styles.itemType}>{title}</span>
        {detail && <span className={styles.itemDetail}>{detail}</span>}
      </div>
      <div className={styles.itemActions}>
        <ActionButton size="sm" onClick={() => reply("always")}>
          {t["permission.allow"]}
        </ActionButton>
        <ActionButton size="sm" variant="secondary" onClick={() => reply("once")}>
          {t["permission.once"]}
        </ActionButton>
        <ActionButton size="sm" variant="ghost" onClick={() => reply("reject")}>
          {t["permission.deny"]}
        </ActionButton>
      </div>
    </div>
  );
}

type QueueProps = {
  permissions: Map<string, Permission>;
};

/**
 * パーミッションリクエストのキュー表示。
 *
 * TodoHeader / FileChangesHeader と同じバースタイルで InputArea の直上に表示。
 * 先頭の1件を常に展開し、2件以上ある場合はバッジ表示 + 折りたたみで残りを表示。
 */
export function PermissionQueue({ permissions }: QueueProps) {
  const t = useLocale();
  const [expanded, setExpanded] = useState(false);

  if (permissions.size === 0) return null;

  const sorted = Array.from(permissions.values());
  const first = sorted[0];
  const rest = sorted.slice(1);

  return (
    <div className={styles.root}>
      {/* ヘッダーバー */}
      <div
        className={styles.bar}
        onClick={rest.length > 0 ? () => setExpanded((s) => !s) : undefined}
        style={rest.length > 0 ? { cursor: "pointer" } : undefined}
      >
        <ShieldIcon className={styles.icon} />
        <span className={styles.label}>{t["permission.title"]}</span>
        <span className={styles.count}>{sorted.length}</span>
        {rest.length > 0 && (
          <span className={`${styles.chevron} ${expanded ? styles.expanded : ""}`}>
            <ChevronRightIcon />
          </span>
        )}
      </div>

      {/* 先頭のパーミッション（常に表示） */}
      <div className={styles.body}>
        <PermissionItem permission={first} />

        {/* 残りのパーミッション（展開時のみ） */}
        {expanded && rest.map((perm) => <PermissionItem key={perm.id} permission={perm} />)}
      </div>
    </div>
  );
}

// 後方互換: 単体テスト等で使う場合に備えた re-export
export { PermissionItem as PermissionView };
