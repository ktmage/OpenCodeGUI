import { useRef, useEffect, useCallback } from "react";
import type { Permission } from "@opencode-ai/sdk";
import type { MessageWithParts } from "../App";
import { useLocale } from "../locales";
import { MessageItem } from "./MessageItem";
import { StreamingIndicator } from "./StreamingIndicator";

type Props = {
  messages: MessageWithParts[];
  sessionBusy: boolean;
  activeSessionId: string;
  permissions: Map<string, Permission>;
  onEditAndResend: (messageId: string, text: string) => void;
  onRevertToCheckpoint: (assistantMessageId: string, userText: string | null) => void;
};

export function MessagesArea({ messages, sessionBusy, activeSessionId, permissions, onEditAndResend, onRevertToCheckpoint }: Props) {
  const t = useLocale();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sessionBusy]);

  return (
    <div className="messages-area">
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
              <div
                className="checkpoint-divider"
                onClick={() => {
                  // 次のユーザーメッセージのテキストを取得して入力欄に戻す
                  const userMsg = nextMsg;
                  const textParts = userMsg.parts.filter((p) => p.type === "text" && !(p as any).synthetic);
                  const fallbackParts = textParts.length > 0 ? textParts : userMsg.parts.filter((p) => p.type === "text");
                  const userText = fallbackParts.map((p) => (p as any).text).join("") || null;
                  // revert API は指定 ID 以降を削除するので、user メッセージの ID を渡す
                  // こうすることで assistant メッセージまでは残る
                  onRevertToCheckpoint(userMsg.info.id, userText);
                }}
                title={t["checkpoint.revertTitle"]}
              >
                <div className="checkpoint-line" />
                <button className="checkpoint-button">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2.006 8.267L.78 9.5 3.28 12l2.5-2.5L4.56 8.28l-1.054 1.06a5.001 5.001 0 0 1 8.98-3.89l1.054-.98A6.002 6.002 0 0 0 3.507 7.21L2.006 8.267zM13.994 7.733L15.22 6.5 12.72 4l-2.5 2.5 1.22 1.22 1.054-1.06a5.001 5.001 0 0 1-8.98 3.89l-1.054.98a6.002 6.002 0 0 0 10.007-1.566l1.527-2.231z" />
                  </svg>
                  <span>{t["checkpoint.retryFromHere"]}</span>
                </button>
                <div className="checkpoint-line" />
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
