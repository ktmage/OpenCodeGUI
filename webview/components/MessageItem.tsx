import { useState, useRef, useEffect, useCallback } from "react";
import type { Permission, TextPart, ReasoningPart as ReasoningPartType } from "@opencode-ai/sdk";
import type { MessageWithParts } from "../App";
import { useLocale } from "../locales";
import { TextPartView } from "./TextPartView";
import { ToolPartView } from "./ToolPartView";
import { PermissionView } from "./PermissionView";

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

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    }
    if (e.key === "Escape") {
      setEditing(false);
    }
  }, [handleEditSubmit]);

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
                <button className="message-edit-cancel" onClick={() => setEditing(false)}>{t["message.cancel"]}</button>
                <button className="message-edit-submit" onClick={handleEditSubmit} disabled={!editText.trim()}>{t["message.send"]}</button>
              </div>
            </div>
          ) : (
            <div className="message-user-bubble" onClick={handleStartEdit} title={t["message.clickToEdit"]}>
              <div className="message-content">{userText}</div>
              <div className="message-edit-icon">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z" />
                </svg>
              </div>
            </div>
          )}
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
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
              <path d="M7.5 4.5h1v4h-1zM7.5 10h1v1.5h-1z" />
            </svg>
          ) : (
            <svg className="tool-part-spinner" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <span className="reasoning-part-label">{isComplete ? t["message.thought"] : t["message.thinking"]}</span>
        <span className={`tool-part-chevron ${expanded ? "expanded" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5.3 5.3-5.3 5.4z" />
          </svg>
        </span>
      </div>
      {expanded && (
        <div className="reasoning-part-body">
          {part.text}
        </div>
      )}
    </div>
  );
}
