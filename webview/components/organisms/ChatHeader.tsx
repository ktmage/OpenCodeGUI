import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../../locales";
import { IconButton } from "../atoms/IconButton";
import { AddIcon, ListIcon } from "../atoms/icons";
import styles from "./ChatHeader.module.css";

type Props = {
  activeSession: Session | null;
  onNewSession: () => void;
  onToggleSessionList: () => void;
};

export function ChatHeader({ activeSession, onNewSession, onToggleSessionList }: Props) {
  const t = useLocale();
  return (
    <div className={styles.root}>
      <IconButton onClick={onToggleSessionList} title={t["header.sessions"]}>
        <ListIcon />
      </IconButton>
      <span className={styles.title}>{activeSession?.title || t["header.title.fallback"]}</span>
      <div className={styles.actions}>
        <IconButton onClick={onNewSession} title={t["header.newChat"]}>
          <AddIcon />
        </IconButton>
      </div>
    </div>
  );
}
