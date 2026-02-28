import type { Session, ToolPart } from "@opencode-ai/sdk";
import { useLocale } from "../../../locales";
import { AgentIcon, ChevronRightIcon, SpinnerIcon } from "../../atoms/icons";
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

/** SubtaskPart または task ToolPart から表示用データを抽出する */
function extractSubtaskInfo(part: SubtaskPart | ToolPart): {
  agent: string;
  description: string;
  prompt: string;
  isActive: boolean;
  isError: boolean;
  errorMessage?: string;
} {
  if (part.type === "subtask") {
    return {
      agent: part.agent,
      description: part.description,
      prompt: part.prompt,
      isActive: false,
      isError: false,
    };
  }
  // type === "tool" && tool === "task"
  const input = (part.state.status !== "pending" ? part.state.input : {}) as Record<string, unknown>;
  const agent = (input.subagent_type as string) ?? (input.agent as string) ?? "";
  const description = (input.description as string) ?? "";
  const prompt = (input.prompt as string) ?? (input.task_instructions as string) ?? "";
  const isActive = part.state.status === "running" || part.state.status === "pending";
  const isError = part.state.status === "error";
  const errorMessage = isError ? (part.state as { error: string }).error : undefined;
  return { agent, description, prompt, isActive, isError, errorMessage };
}

type Props = {
  part: SubtaskPart | ToolPart;
  childSessions: Session[];
  onNavigateToChild: (sessionId: string) => void;
};

/**
 * subtask パートまたは task ツール呼び出しを表示するコンポーネント。
 * OpenCode は subtask を「task」ツール呼び出し（type: "tool", tool: "task"）として
 * 送信するため、両方に対応する。クリックで対応する子セッションにナビゲートする。
 */
export function SubtaskPartView({ part, childSessions, onNavigateToChild }: Props) {
  const t = useLocale();

  const { agent, description, prompt, isActive, isError, errorMessage } = extractSubtaskInfo(part);
  const displayText = description || prompt;

  // subtask パートに対応する子セッションを探す。
  // 子セッションの title がサブタスクの description と一致するケースが多い。
  // 見つからない場合はナビゲーション不可（バー表示のみ）。
  const matchedChild = childSessions.find((s) => s.title === description || s.title === prompt);

  const handleClick = () => {
    if (matchedChild) {
      onNavigateToChild(matchedChild.id);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header} onClick={handleClick} style={matchedChild ? undefined : { cursor: "default" }}>
        <span className={styles.icon}>
          {isActive ? (
            <SpinnerIcon className={styles.spinner} />
          ) : (
            <AgentIcon />
          )}
        </span>
        <span className={`${styles.action} ${isError ? styles.actionError : ""}`}>
          {t["childSession.agent"]}
        </span>
        <span className={styles.title} title={displayText}>
          {agent ? `${agent}: ` : ""}{displayText}
        </span>
        {matchedChild && (
          <span className={styles.navigate}>
            <ChevronRightIcon />
          </span>
        )}
      </div>
      {isError && errorMessage && (
        <div className={styles.errorBody}>
          <pre className={styles.errorText}>{errorMessage}</pre>
        </div>
      )}
    </div>
  );
}

/** task ツール呼び出しかどうかを判定するヘルパー */
export function isTaskToolPart(part: { type: string; tool?: string }): boolean {
  return part.type === "tool" && part.tool === "task";
}

export type { SubtaskPart };
