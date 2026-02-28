import type { Session } from "@opencode-ai/sdk";
import type { en } from "../../../locales/en";
import { useLocale } from "../../../locales";
import { IconButton } from "../../atoms/IconButton";
import { DeleteIcon, FileIcon } from "../../atoms/icons";
import styles from "./SessionList.module.css";

type Props = {
  sessions: Session[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onClose: () => void;
};

export function formatRelativeTime(timestamp: number, t: typeof en): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return t["time.now"];
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t["time.minutes"](minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t["time.hours"](hours);
  const days = Math.floor(hours / 24);
  return t["time.days"](days);
}

export function SessionList({ sessions, activeSessionId, onSelect, onDelete, onClose }: Props) {
  const t = useLocale();
  return (
    <>
      {/* Backdrop to close session list on outside click */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={onClose} />
      <div className={styles.root}>
        {sessions.length === 0 ? (
          <div style={{ padding: "12px", fontSize: 12, color: "var(--vscode-descriptionForeground)" }}>
            {t["session.noSessions"]}
          </div>
        ) : (
          sessions.map((session) => {
            const summary = session.summary;
            const hasSummary = summary && (summary.files > 0 || summary.additions > 0 || summary.deletions > 0);
            return (
              <div
                key={session.id}
                className={`${styles.item} ${session.id === activeSessionId ? styles.active : ""}`}
                onClick={() => onSelect(session.id)}
                title={session.title || t["session.select"]}
              >
                <div className={styles.itemContent}>
                  <span className={styles.itemTitle}>{session.title || t["session.untitled"]}</span>
                  <span className={styles.itemMeta}>
                    <span className={styles.itemTime}>{formatRelativeTime(session.time.updated, t)}</span>
                    {hasSummary && (
                      <span className={styles.itemStats}>
                        <span className={styles.itemFiles}>
                          <FileIcon width={10} height={10} />
                          {summary.files}
                        </span>
                        <span className={styles.itemAdditions}>+{summary.additions}</span>
                        <span className={styles.itemDeletions}>-{summary.deletions}</span>
                      </span>
                    )}
                  </span>
                </div>
                <IconButton
                  className={styles.itemDelete}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  title={t["session.delete"]}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
