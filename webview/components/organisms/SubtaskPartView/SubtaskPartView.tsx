import type { Session } from "@opencode-ai/sdk";
import { useLocale } from "../../../locales";
import { AgentIcon, ChevronRightIcon } from "../../atoms/icons";
import styles from "./SubtaskPartView.module.css";

/** SDK の subtask パート型（Part ユニオンの一メンバー） */
type SubtaskPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "subtask";
  prompt: string;
  description: string;
  agent: string;
};

type Props = {
  part: SubtaskPart;
  childSessions: Session[];
  onNavigateToChild: (sessionId: string) => void;
};

/**
 * subtask パートを ToolPartView と同じ折りたたみバー形式で表示するコンポーネント。
 * クリックで対応する子セッションにナビゲートする。
 */
export function SubtaskPartView({ part, childSessions, onNavigateToChild }: Props) {
  const t = useLocale();

  // subtask パートに対応する子セッションを探す。
  // 子セッションの title がサブタスクの description と一致するケースが多い。
  // 見つからない場合はナビゲーション不可（バー表示のみ）。
  const matchedChild = childSessions.find((s) => s.title === part.description || s.title === part.prompt);

  const handleClick = () => {
    if (matchedChild) {
      onNavigateToChild(matchedChild.id);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header} onClick={handleClick} style={matchedChild ? undefined : { cursor: "default" }}>
        <span className={styles.icon}>
          <AgentIcon />
        </span>
        <span className={styles.action}>{t["childSession.agent"]}</span>
        <span className={styles.title} title={part.description || part.prompt}>
          {part.agent}: {part.description || part.prompt}
        </span>
        {matchedChild && (
          <span className={styles.navigate}>
            <ChevronRightIcon />
          </span>
        )}
      </div>
    </div>
  );
}

export type { SubtaskPart };
