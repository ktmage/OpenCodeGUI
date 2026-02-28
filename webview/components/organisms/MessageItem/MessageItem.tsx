import type { Permission, ReasoningPart as ReasoningPartType, TextPart, ToolPart } from "@opencode-ai/sdk";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MessageWithParts } from "../../../App";
import { useAppContext } from "../../../contexts/AppContext";
import { useLocale } from "../../../locales";
import { ActionButton } from "../../atoms/ActionButton";
import { ChevronRightIcon, EditIcon, InfoCircleIcon, SpinnerIcon } from "../../atoms/icons";
import { ShellResultView } from "../../molecules/ShellResultView";
import { TextPartView } from "../../molecules/TextPartView";
import { PermissionView } from "../PermissionView";
import { ToolPartView } from "../ToolPartView";
import styles from "./MessageItem.module.css";

type Props = {
  message: MessageWithParts;
  activeSessionId: string;
  permissions: Map<string, Permission>;
  onEditAndResend?: (messageId: string, text: string) => void;
};

export function MessageItem({ message, activeSessionId, permissions, onEditAndResend }: Props) {
  const t = useLocale();
  const { isShellMessage } = useAppContext();
  const { info, parts } = message;
  const isUser = info.role === "user";
  const isShellUser = isUser && isShellMessage(info.id);
  const isShell = !isUser && isShellMessage(info.id);
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
    <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
      {isUser ? (
        // シェルコマンドのユーザーメッセージは非表示。
        // ShellResultView が "$ command" を既に表示しているため冗長。
        isShellUser ? null : (
          <>
            {editing ? (
              <div className={styles.editContainer}>
                <textarea
                  ref={editRef}
                  className={styles.editTextarea}
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={handleEditKeyDown}
                  rows={1}
                />
                <div className={styles.editActions}>
                  <ActionButton variant="ghost" size="sm" onClick={() => setEditing(false)}>
                    {t["message.cancel"]}
                  </ActionButton>
                  <ActionButton size="sm" onClick={handleEditSubmit} disabled={!editText.trim()}>
                    {t["message.send"]}
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div className={styles.userBubble} onClick={handleStartEdit} title={t["message.clickToEdit"]}>
                <div className={styles.content}>{userText}</div>
                <div className={styles.editIcon}>
                  <EditIcon width={12} height={12} />
                </div>
              </div>
            )}
            {userFiles.length > 0 && (
              <div className={styles.userFiles}>
                {userFiles.map((name, i) => (
                  <span key={i} className={styles.userFileChip}>
                    {name}
                  </span>
                ))}
              </div>
            )}
          </>
        )
      ) : (
        <div className={styles.content}>
          {isShell ? (
            // ユーザーが ! プレフィクスで実行したシェルコマンドの結果をターミナル風に表示する。
            // TextPart（“The following tool was executed by the user” 等）は不要なので非表示。
            <ShellResultView parts={parts.filter((p) => p.type === "tool") as ToolPart[]} />
          ) : (
            parts.map((part) => {
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
            })
          )}
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
    <div className={`${styles.reasoningPart} ${isComplete ? "" : styles.reasoningActive}`}>
      <div className={styles.reasoningHeader} onClick={() => setExpanded((s) => !s)} title={t["message.toggleThought"]}>
        <span className={styles.reasoningIcon}>
          {isComplete ? <InfoCircleIcon /> : <SpinnerIcon className={styles.spinner} width={14} height={14} />}
        </span>
        <span className={styles.reasoningLabel}>{isComplete ? t["message.thought"] : t["message.thinking"]}</span>
        <span className={`${styles.chevron} ${expanded ? styles.expanded : ""}`}>
          <ChevronRightIcon />
        </span>
      </div>
      {expanded && <div className={styles.reasoningBody}>{part.text}</div>}
    </div>
  );
}
