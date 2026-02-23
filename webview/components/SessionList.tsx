import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../locales";

type Props = {
  sessions: Session[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  onClose: () => void;
};

export function SessionList({
  sessions,
  activeSessionId,
  onSelect,
  onDelete,
  onClose,
}: Props) {
  const t = useLocale();
  return (
    <>
      {/* Backdrop to close session list on outside click */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9 }}
        onClick={onClose}
      />
      <div className="session-list">
        {sessions.length === 0 ? (
          <div style={{ padding: "12px", fontSize: 12, color: "var(--vscode-descriptionForeground)" }}>
            {t["session.noSessions"]}
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${session.id === activeSessionId ? "active" : ""}`}
              onClick={() => onSelect(session.id)}
            >
              <span className="session-item-title">
                {session.title || t["session.untitled"]}
              </span>
              <button
                className="btn-icon session-item-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                title={t["session.delete"]}
              >
                {/* Codicon: trash */}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M10 3h3v1h-1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V4H3V3h3V2a1 1 0 011-1h2a1 1 0 011 1v1zM5 4v9h6V4H5zm2-1V2H7v1h2V2H9v1z" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
