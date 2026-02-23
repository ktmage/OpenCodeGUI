import type { Session } from "@opencode-ai/sdk";

type Props = {
  activeSession: Session | null;
  onNewSession: () => void;
  onToggleSessionList: () => void;
};

export function ChatHeader({ activeSession, onNewSession, onToggleSessionList }: Props) {
  return (
    <div className="chat-header">
      <button
        className="btn-icon"
        onClick={onToggleSessionList}
        title="Sessions"
      >
        {/* Codicon: list-unordered */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 3h1v1H2V3zm3 0h9v1H5V3zM2 7h1v1H2V7zm3 0h9v1H5V7zm-3 4h1v1H2v-1zm3 0h9v1H5v-1z" />
        </svg>
      </button>
      <span className="chat-header-title">
        {activeSession?.title || "OpenCode"}
      </span>
      <div className="chat-header-actions">
        <button
          className="btn-icon"
          onClick={onNewSession}
          title="New chat"
        >
          {/* Codicon: add */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1v7H1v1h7v7h1V9h7V8H9V1H8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
