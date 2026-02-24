import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../locales";

type Props = {
  activeSession: Session | null;
  onNewSession: () => void;
  onToggleSessionList: () => void;
};

export function ChatHeader({ activeSession, onNewSession, onToggleSessionList }: Props) {
  const t = useLocale();
  return (
    <div className="chat-header">
      <button type="button" className="btn-icon" onClick={onToggleSessionList} title={t["header.sessions"]}>
        {/* Codicon: list-unordered */}
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 3h1v1H2V3zm3 0h9v1H5V3zM2 7h1v1H2V7zm3 0h9v1H5V7zm-3 4h1v1H2v-1zm3 0h9v1H5v-1z" />
        </svg>
      </button>
      <span className="chat-header-title">{activeSession?.title || t["header.title.fallback"]}</span>
      <div className="chat-header-actions">
        <button type="button" className="btn-icon" onClick={onNewSession} title={t["header.newChat"]}>
          {/* Codicon: add */}
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1v7H1v1h7v7h1V9h7V8H9V1H8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
