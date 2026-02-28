import type { Permission } from "@opencode-ai/sdk";
import { useLocale } from "../../../locales";
import { postMessage } from "../../../vscode-api";
import { ActionButton } from "../../atoms/ActionButton";
import styles from "./PermissionView.module.css";

type Props = {
  permission: Permission;
  activeSessionId: string;
};

export function PermissionView({ permission, activeSessionId }: Props) {
  const t = useLocale();
  const reply = (response: "once" | "always" | "reject") => {
    postMessage({
      type: "replyPermission",
      sessionId: activeSessionId,
      permissionId: permission.id,
      response,
    });
  };

  return (
    <div className={styles.root}>
      <div className={styles.title}>{permission.title}</div>
      <div className={styles.actions}>
        <ActionButton onClick={() => reply("always")}>
          {t["permission.allow"]}
        </ActionButton>
        <ActionButton variant="secondary" onClick={() => reply("once")}>
          {t["permission.once"]}
        </ActionButton>
        <ActionButton variant="secondary" onClick={() => reply("reject")}>
          {t["permission.deny"]}
        </ActionButton>
      </div>
    </div>
  );
}
