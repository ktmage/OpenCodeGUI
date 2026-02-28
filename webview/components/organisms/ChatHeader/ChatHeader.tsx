import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../../../locales";
import { IconButton } from "../../atoms/IconButton";
import { AddIcon, BackIcon, ListIcon, SummaryIcon } from "../../atoms/icons";
import styles from "./ChatHeader.module.css";

type Props = {
  activeSession: Session | null;
  onNewSession: () => void;
  onToggleSessionList: () => void;
  onNavigateToParent?: () => void;
  onToggleSummary?: () => void;
  hasSummaries?: boolean;
};

export function ChatHeader({
  activeSession,
  onNewSession,
  onToggleSessionList,
  onNavigateToParent,
  onToggleSummary,
  hasSummaries,
}: Props) {
  const t = useLocale();
  return (
    <div className={styles.root}>
      {onNavigateToParent ? (
        <IconButton onClick={onNavigateToParent} title={t["childSession.backToParent"]}>
          <BackIcon />
        </IconButton>
      ) : (
        <IconButton onClick={onToggleSessionList} title={t["header.sessions"]}>
          <ListIcon />
        </IconButton>
      )}
      <span className={styles.title}>{activeSession?.title || t["header.title.fallback"]}</span>
      <div className={styles.actions}>
        {hasSummaries && onToggleSummary && (
          <IconButton onClick={onToggleSummary} title={t["summary.showSummary"]}>
            <SummaryIcon />
          </IconButton>
        )}
        {!onNavigateToParent && (
          <IconButton onClick={onNewSession} title={t["header.newChat"]}>
            <AddIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}
