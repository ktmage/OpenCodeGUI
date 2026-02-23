import type { Permission } from "@opencode-ai/sdk";
import type { MessageWithParts } from "../App";
import { TextPartView } from "./TextPartView";
import { ToolPartView } from "./ToolPartView";
import { PermissionView } from "./PermissionView";

type Props = {
  message: MessageWithParts;
  activeSessionId: string;
  permissions: Map<string, Permission>;
};

export function MessageItem({ message, activeSessionId, permissions }: Props) {
  const { info, parts } = message;
  const isUser = info.role === "user";

  // このメッセージに紐づくパーミッションリクエストを取得する
  const messagePermissions = Array.from(permissions.values()).filter(
    (p) => p.messageID === info.id,
  );

  // ユーザーメッセージはテキストパートのみ抽出して表示する
  const userText = isUser
    ? parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { text: string }).text)
        .join("")
    : null;

  return (
    <div className="message">
      <div className={`message-role ${isUser ? "user" : ""}`}>
        {isUser ? "You" : "OpenCode"}
      </div>
      {isUser ? (
        <div className="message-content">{userText}</div>
      ) : (
        <div className="message-content">
          {parts.map((part) => {
            switch (part.type) {
              case "text":
                return <TextPartView key={part.id} part={part} />;
              case "tool":
                return <ToolPartView key={part.id} part={part} />;
              default:
                return null;
            }
          })}
          {messagePermissions.map((perm) => (
            <PermissionView key={perm.id} permission={perm} activeSessionId={activeSessionId} />
          ))}
        </div>
      )}
    </div>
  );
}
