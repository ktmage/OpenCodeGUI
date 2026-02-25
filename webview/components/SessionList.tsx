import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../locales";

type Props = {
  sessions: Session[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onClose: () => void;
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function SessionList({ sessions, activeSessionId, onSelect, onDelete, onClose }: Props) {
  const t = useLocale();
  return (
    <>
      {/* Backdrop to close session list on outside click */}
      <div style={{ position: "fixed", inset: 0, zIndex: 9 }} onClick={onClose} />
      <div className="session-list">
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
                className={`session-item ${session.id === activeSessionId ? "active" : ""}`}
                onClick={() => onSelect(session.id)}
                title={session.title || t["session.select"]}
              >
                <div className="session-item-content">
                  <span className="session-item-title">{session.title || t["session.untitled"]}</span>
                  <span className="session-item-meta">
                    <span className="session-item-time">{formatRelativeTime(session.time.updated)}</span>
                    {hasSummary && (
                      <span className="session-item-stats">
                        <span className="session-item-files">
                          <svg aria-hidden="true" width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.71 4.29l-3-3A1 1 0 0010 1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V5a1 1 0 00-.29-.71zM12 14H4V2h5v3a1 1 0 001 1h3v8z" />
                          </svg>
                          {summary.files}
                        </span>
                        <span className="session-item-additions">+{summary.additions}</span>
                        <span className="session-item-deletions">-{summary.deletions}</span>
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-icon session-item-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                  }}
                  title={t["session.delete"]}
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M10 3h3v1h-1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4H3V3h3V2a1 1 0 011-1h2a1 1 0 011 1v1zM5 4v9h6V4H5zm2-1V2H7v1h2V2H9v1z" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
