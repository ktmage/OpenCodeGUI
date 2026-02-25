import type { Permission } from "@opencode-ai/sdk";
import { useEffect, useRef } from "react";
import type { MessageWithParts } from "../../App";
import { useLocale } from "../../locales";
import { RevertIcon } from "../atoms/icons";
import { MessageItem } from "./MessageItem";
import { StreamingIndicator } from "../atoms/StreamingIndicator";

type Props = {
  messages: MessageWithParts[];
  sessionBusy: boolean;
  activeSessionId: string;
  permissions: Map<string, Permission>;
  onEditAndResend: (messageId: string, text: string) => void;
  onRevertToCheckpoint: (assistantMessageId: string, userText: string | null) => void;
};

export function MessagesArea({
  messages,
  sessionBusy,
  activeSessionId,
  permissions,
  onEditAndResend,
  onRevertToCheckpoint,
}: Props) {
  const t = useLocale();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
                  const fallbackParts =
                    textParts.length > 0 ? textParts : userMsg.parts.filter((p) => p.type === "text");
                  const userText = fallbackParts.map((p) => (p as any).text).join("") || null;
                  // revert API は指定 ID 以降を削除するので、user メッセージの ID を渡す
                  // こうすることで assistant メッセージまでは残る
                  onRevertToCheckpoint(userMsg.info.id, userText);
                }}
                title={t["checkpoint.revertTitle"]}
              >
                <div className="checkpoint-line" />
                <button type="button" className="checkpoint-button">
                  <RevertIcon />
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
