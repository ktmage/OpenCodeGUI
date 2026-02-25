import type { Permission, ReasoningPart as ReasoningPartType, TextPart } from "@opencode-ai/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MessageWithParts } from "../App";
import { useLocale } from "../locales";
import { ChevronRightIcon, EditIcon, InfoCircleIcon, SpinnerIcon } from "./atoms/icons";
import { PermissionView } from "./PermissionView";
import { TextPartView } from "./TextPartView";
import { ToolPartView } from "./ToolPartView";

type Props = {
  message: MessageWithParts;
  activeSessionId: string;
  permissions: Map<string, Permission>;
  onEditAndResend?: (messageId: string, text: string) => void;
};

export function MessageItem({ message, activeSessionId, permissions, onEditAndResend }: Props) {
  const t = useLocale();
  const { info, parts } = message;
  const isUser = info.role === "user";
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const editRef = useRef<HTMLTextAreaElement>(null);

  // このメッセージに紐づくパーミッションリクエストを取得する
  const messagePermissions = Array.from(permissions.values()).filter((p) => p.messageID === info.id);

  // ユーザーメッセージはテキストパートのみ抽出
  // synthetic かつテキストが空でないものは SDK がファイルコンテキスト用に生成したもの
  // ただし全パートが synthetic の場合は全て表示する（フォールバック）
  const textParts = isUser ? parts.filter((p) => p.type === "text") : [];
  const nonSyntheticTexts = textParts.filter((p) => !(p as TextPart).synthetic);
  const displayTextParts = nonSyntheticTexts.length > 0 ? nonSyntheticTexts : textParts;
  const userText = isUser ? displayTextParts.map((p) => (p as { text: string }).text).join("") : null;

  // ユーザーメッセージに添付されたファイルパートを取得する
  const userFiles = isUser
    ? parts
        .filter((p) => p.type === "file")
        .map((p) => {
          const fp = p as { filename?: string; url?: string };
          const name = fp.filename ?? fp.url ?? "file";
          // file:// プレフィックスを除去し、パスのファイル名だけ表示する
          const cleaned = name.replace(/^file:\/\//, "");
          const basename = cleaned.split("/").pop() ?? cleaned;
          return basename;
        })
    : [];

  const handleStartEdit = useCallback(() => {
    if (!isUser || !userText) return;
    setEditText(userText);
    setEditing(true);
  }, [isUser, userText]);

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      // テキストエリアの高さを内容に合わせる
      editRef.current.style.height = "auto";
      editRef.current.style.height = `${editRef.current.scrollHeight}px`;
    }
  }, [editing]);

  const handleEditSubmit = useCallback(() => {
    const trimmed = editText.trim();
    if (!trimmed || !onEditAndResend) return;
    setEditing(false);
    onEditAndResend(info.id, trimmed);
  }, [editText, info.id, onEditAndResend]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleEditSubmit();
      }
      if (e.key === "Escape") {
        setEditing(false);
      }
    },
    [handleEditSubmit],
  );

  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      {isUser ? (
        <>
          {editing ? (
            <div className="message-edit-container">
              <textarea
                ref={editRef}
                className="message-edit-textarea"
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={handleEditKeyDown}
                rows={1}
              />
              <div className="message-edit-actions">
                <button type="button" className="message-edit-cancel" onClick={() => setEditing(false)}>
                  {t["message.cancel"]}
                </button>
                <button
                  type="button"
                  className="message-edit-submit"
                  onClick={handleEditSubmit}
                  disabled={!editText.trim()}
                >
                  {t["message.send"]}
                </button>
              </div>
            </div>
          ) : (
            <div className="message-user-bubble" onClick={handleStartEdit} title={t["message.clickToEdit"]}>
              <div className="message-content">{userText}</div>
              <div className="message-edit-icon">
                <EditIcon width={12} height={12} />
              </div>
            </div>
          )}
          {userFiles.length > 0 && (
            <div className="message-user-files">
              {userFiles.map((name, i) => (
                <span key={i} className="message-user-file-chip">
                  {name}
                </span>
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
              case "reasoning":
                return <ReasoningPartView key={part.id} part={part as ReasoningPartType} />;
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

/** Thinking/Reasoning パートの折りたたみ表示 */
function ReasoningPartView({ part }: { part: ReasoningPartType }) {
  const t = useLocale();
  const [expanded, setExpanded] = useState(false);
  const isComplete = !!part.time?.end;

  return (
    <div className={`reasoning-part ${isComplete ? "complete" : "active"}`}>
      <div className="reasoning-part-header" onClick={() => setExpanded((s) => !s)} title={t["message.toggleThought"]}>
        <span className="reasoning-part-icon">
          {isComplete ? (
            <InfoCircleIcon />
          ) : (
            <SpinnerIcon className="tool-part-spinner" width={14} height={14} />
          )}
        </span>
        <span className="reasoning-part-label">{isComplete ? t["message.thought"] : t["message.thinking"]}</span>
        <span className={`tool-part-chevron ${expanded ? "expanded" : ""}`}>
          <ChevronRightIcon />
        </span>
      </div>
      {expanded && <div className="reasoning-part-body">{part.text}</div>}
    </div>
  );
}
