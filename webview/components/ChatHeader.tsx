import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../locales";
import { AddIcon, ListIcon } from "./atoms/icons";

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
        <ListIcon />
      </button>
      <span className="chat-header-title">{activeSession?.title || t["header.title.fallback"]}</span>
      <div className="chat-header-actions">
        <button type="button" className="btn-icon" onClick={onNewSession} title={t["header.newChat"]}>
          <AddIcon />
        </button>
      </div>
    </div>
  );
}
