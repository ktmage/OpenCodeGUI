import type { Permission } from "@opencode-ai/sdk";
import { useLocale } from "../locales";
import { postMessage } from "../vscode-api";

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
    <div className="permission-request">
      <div className="permission-title">{permission.title}</div>
      <div className="permission-actions">
        <button type="button" className="btn" onClick={() => reply("always")}>
          {t["permission.allow"]}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => reply("once")}>
          {t["permission.once"]}
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => reply("reject")}>
          {t["permission.deny"]}
        </button>
      </div>
    </div>
  );
}
