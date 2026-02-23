import type { Permission, TextPart } from "@opencode-ai/sdk";
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

  // ユーザーメッセージはテキストパートのみ抽出
  // synthetic かつテキストが空でないものは SDK がファイルコンテキスト用に生成したもの
  // ただし全パートが synthetic の場合は全て表示する（フォールバック）
  const textParts = isUser ? parts.filter((p) => p.type === "text") : [];
  const nonSyntheticTexts = textParts.filter((p) => !(p as TextPart).synthetic);
  const displayTextParts = nonSyntheticTexts.length > 0 ? nonSyntheticTexts : textParts;
  const userText = isUser
    ? displayTextParts.map((p) => (p as { text: string }).text).join("")
    : null;

  // ユーザーメッセージに添付されたファイルパートを取得する
  const userFiles = isUser
    ? parts.filter((p) => p.type === "file").map((p) => {
        const fp = p as { filename?: string; url?: string };
        const name = fp.filename ?? fp.url ?? "file";
        // file:// プレフィックスを除去し、パスのファイル名だけ表示する
        const cleaned = name.replace(/^file:\/\//, "");
        const basename = cleaned.split("/").pop() ?? cleaned;
        return basename;
      })
    : [];

  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      {isUser ? (
        <>
          <div className="message-user-bubble">
            <div className="message-content">{userText}</div>
          </div>
          {userFiles.length > 0 && (
            <div className="message-user-files">
              {userFiles.map((name, i) => (
                <span key={i} className="message-user-file-chip">{name}</span>
              ))}
            </div>
          )}
        </>
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
