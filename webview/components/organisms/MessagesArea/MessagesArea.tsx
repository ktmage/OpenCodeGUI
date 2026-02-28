import type { Permission } from "@opencode-ai/sdk";
import { useEffect, useRef } from "react";
import type { MessageWithParts } from "../../../App";
import { useLocale } from "../../../locales";
import { ForkIcon, RevertIcon } from "../../atoms/icons";
import { StreamingIndicator } from "../../atoms/StreamingIndicator";
import { MessageItem } from "../MessageItem";
import styles from "./MessagesArea.module.css";

type Props = {
  messages: MessageWithParts[];
  sessionBusy: boolean;
  activeSessionId: string;
  permissions: Map<string, Permission>;
  onEditAndResend: (messageId: string, text: string) => void;
  onRevertToCheckpoint: (assistantMessageId: string, userText: string | null) => void;
  onForkFromCheckpoint: (messageId: string) => void;
};

export function MessagesArea({
  messages,
  sessionBusy,
  activeSessionId,
  permissions,
  onEditAndResend,
  onRevertToCheckpoint,
  onForkFromCheckpoint,
}: Props) {
  const t = useLocale();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className={styles.root}>
      {messages.map((msg, index) => {
        // アシスタントメッセージの直後にチェックポイント区切り線を表示する
        // ただし最後のメッセージの後、busy 中、次がユーザーメッセージの場合のみ
        const isAssistant = msg.info.role === "assistant";
        const nextMsg = messages[index + 1];
        const showCheckpoint = isAssistant && nextMsg && nextMsg.info.role === "user";

        return (
          <div key={msg.info.id}>
            <MessageItem
              message={msg}
              activeSessionId={activeSessionId}
              permissions={permissions}
              onEditAndResend={onEditAndResend}
            />
            {showCheckpoint && (
              <div className={styles.checkpointDivider} title={t["checkpoint.revertTitle"]}>
                <div className={styles.checkpointLine} />
                <button
                  type="button"
                  className={styles.checkpointButton}
                  onClick={() => {
                    // 次のユーザーメッセージのテキストを取得して入力欄に戻す
                    const userMsg = nextMsg;
                    const textParts = userMsg.parts.filter((p) => p.type === "text" && !(p as any).synthetic);
                    const fallbackParts =
                      textParts.length > 0 ? textParts : userMsg.parts.filter((p) => p.type === "text");
                    const userText = fallbackParts.map((p) => (p as any).text).join("") || null;
                    // revert API は指定 ID 以降を削除するので、user メッセージの ID を渡す
                    // こうすることで assistant メッセージまでは残る
                    onRevertToCheckpoint(userMsg.info.id, userText);
                  }}
                >
                  <RevertIcon />
                  <span>{t["checkpoint.retryFromHere"]}</span>
                </button>
                <button
                  type="button"
                  className={styles.checkpointButton}
                  onClick={() => {
                    // 次のユーザーメッセージの ID を渡す。fork API は指定 ID の手前までをコピーするため、
                    // ユーザーメッセージ ID を渡すことでアシスタント応答までが含まれる
                    onForkFromCheckpoint(nextMsg.info.id);
                  }}
                >
                  <ForkIcon />
                  <span>{t["checkpoint.forkFromHere"]}</span>
                </button>
                <div className={styles.checkpointLine} />
              </div>
            )}
          </div>
        );
      })}
      {sessionBusy && <StreamingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
