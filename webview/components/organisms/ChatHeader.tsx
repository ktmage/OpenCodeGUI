import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../../locales";
import { IconButton } from "../atoms/IconButton";
import { AddIcon, ListIcon } from "../atoms/icons";

type Props = {
  activeSession: Session | null;
  onNewSession: () => void;
  onToggleSessionList: () => void;
};

export function ChatHeader({ activeSession, onNewSession, onToggleSessionList }: Props) {
  const t = useLocale();
  return (
    <div className="chat-header">
      <IconButton onClick={onToggleSessionList} title={t["header.sessions"]}>
        <ListIcon />
      </IconButton>
      <span className="chat-header-title">{activeSession?.title || t["header.title.fallback"]}</span>
      <div className="chat-header-actions">
        <IconButton onClick={onNewSession} title={t["header.newChat"]}>
          <AddIcon />
        </IconButton>
      </div>
    </div>
  );
}
