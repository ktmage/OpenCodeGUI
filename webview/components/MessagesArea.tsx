import { useRef, useEffect } from "react";
import type { Permission } from "@opencode-ai/sdk";
import type { MessageWithParts } from "../App";
import { MessageItem } from "./MessageItem";
import { StreamingIndicator } from "./StreamingIndicator";

type Props = {
  messages: MessageWithParts[];
  sessionBusy: boolean;
  activeSessionId: string;
  permissions: Map<string, Permission>;
};

export function MessagesArea({ messages, sessionBusy, activeSessionId, permissions }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sessionBusy]);

  return (
    <div className="messages-area">
      {messages.map((msg) => (
        <MessageItem key={msg.info.id} message={msg} activeSessionId={activeSessionId} permissions={permissions} />
      ))}
      {sessionBusy && <StreamingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
