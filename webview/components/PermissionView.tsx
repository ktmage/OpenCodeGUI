import type { Permission } from "@opencode-ai/sdk";
import { postMessage } from "../vscode-api";

type Props = {
  permission: Permission;
  activeSessionId: string;
};

export function PermissionView({ permission, activeSessionId }: Props) {
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
        <button className="btn" onClick={() => reply("always")}>
          Allow
        </button>
        <button className="btn btn-secondary" onClick={() => reply("once")}>
          Once
        </button>
        <button className="btn btn-secondary" onClick={() => reply("reject")}>
          Deny
        </button>
      </div>
    </div>
  );
}
