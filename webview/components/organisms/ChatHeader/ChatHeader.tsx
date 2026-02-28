import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../../../locales";
import { IconButton } from "../../atoms/IconButton";
import { AddIcon, BackIcon, ListIcon, ShareIcon, UnshareIcon } from "../../atoms/icons";
import styles from "./ChatHeader.module.css";

type Props = {
  activeSession: Session | null;
  onNewSession: () => void;
  onToggleSessionList: () => void;
  onShareSession?: () => void;
  onUnshareSession?: () => void;
  onNavigateToParent?: () => void;
};

export function ChatHeader({ activeSession, onNewSession, onToggleSessionList, onShareSession, onUnshareSession, onNavigateToParent }: Props) {
  const t = useLocale();
  // 共有中かどうかは session.share?.url の有無で判定する
  const isShared = !!activeSession?.share?.url;
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
        {/* 共有ボタン: セッションがあり、子セッション閲覧中でない場合に表示。
            未共有時は onShareSession が渡されている場合のみ表示する
            （メッセージのない空セッションでは SDK がエラーを返すため）。 */}
        {activeSession && !onNavigateToParent && (
          isShared ? (
            <IconButton onClick={onUnshareSession} title={t["share.unshare"]}>
              <UnshareIcon />
            </IconButton>
          ) : onShareSession ? (
            <IconButton onClick={onShareSession} title={t["share.share"]}>
              <ShareIcon />
            </IconButton>
          ) : null
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
