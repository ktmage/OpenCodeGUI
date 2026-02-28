import type { Event, Message, Part } from "@opencode-ai/sdk";
import { useCallback, useMemo, useRef, useState } from "react";
import type { TodoItem } from "../utils/todo";
import { parseTodos } from "../utils/todo";

export type MessageWithParts = { info: Message; parts: Part[] };

/** メッセージ情報を追加または更新する */
function upsertMessage(prev: MessageWithParts[], info: Message): MessageWithParts[] {
  const idx = prev.findIndex((m) => m.info.id === info.id);
  if (idx >= 0) {
    const updated = [...prev];
    updated[idx] = { ...updated[idx], info };
    return updated;
  }
  return [...prev, { info, parts: [] }];
}

/** パートを追加または更新する */
function upsertPart(prev: MessageWithParts[], part: Part): MessageWithParts[] {
  const idx = prev.findIndex((m) => m.info.id === part.messageID);
  if (idx < 0) return prev;
  const updated = [...prev];
  const msg = { ...updated[idx] };
  const partIdx = msg.parts.findIndex((p) => p.id === part.id);
  if (partIdx >= 0) {
    msg.parts = [...msg.parts];
    msg.parts[partIdx] = part;
  } else {
    msg.parts = [...msg.parts, part];
  }
  updated[idx] = msg;
  return updated;
}

/** メッセージを削除する */
function removeMessage(prev: MessageWithParts[], messageID: string): MessageWithParts[] {
  return prev.filter((m) => m.info.id !== messageID);
}

/**
 * チャットメッセージの状態管理フック。
 *
 * メッセージの実体はサーバー側が保持しているが、AI の応答中はテキストやツール呼び出しの
 * パートが SSE で細かく差分配信されるため、Webview 側でも配列を保持して差分マージすることで
 * ストリーミング表示をリアルタイムに実現している。
 * また、この配列から inputTokens（コンテキスト使用量）や latestTodos を導出している。
 */
export function useMessages() {
  const [messages, setMessages] = useState<MessageWithParts[]>([]);
  const [prefillText, setPrefillText] = useState("");

  // ユーザーが ! プレフィクスで実行したシェルコマンドのメッセージ ID を追跡する。
  // executeShell 呼び出し直前に pendingShell を true にし、
  // 次に到着する assistant の message.updated でそのメッセージ ID を shellMessageIds に登録する。
  const pendingShell = useRef(false);
  const [shellMessageIds, setShellMessageIds] = useState<Set<string>>(new Set());

  const markPendingShell = useCallback(() => {
    pendingShell.current = true;
  }, []);

  const isShellMessage = useCallback((messageId: string) => shellMessageIds.has(messageId), [shellMessageIds]);

  // messages から StepFinishPart のトークン使用量を導出する（圧縮でメッセージが減ると自動的に反映される）
  const inputTokens = useMemo(() => {
    let total = 0;
    for (const m of messages) {
      for (const p of m.parts) {
        if (p.type === "step-finish" && p.tokens) {
          total += p.tokens.input;
        }
      }
    }
    return total;
  }, [messages]);

  // メッセージから最新の ToDo リストを導出（todowrite/todoread ツールの最新の出力）
  const latestTodos = useMemo<TodoItem[]>(() => {
    for (let mi = messages.length - 1; mi >= 0; mi--) {
      const parts = messages[mi].parts;
      for (let pi = parts.length - 1; pi >= 0; pi--) {
        const p = parts[pi];
        if (p.type !== "tool") continue;
        if (p.tool !== "todowrite" && p.tool !== "todoread") continue;
        const st = p.state;
        if (st.status === "completed" && st.output) {
          const parsed = parseTodos(st.output);
          if (parsed) return parsed;
        }
        if (st.status !== "pending") {
          const input = st.input as Record<string, unknown> | undefined;
          if (input) {
            const parsed = parseTodos(input.todos ?? input);
            if (parsed) return parsed;
          }
        }
      }
    }
    return [];
  }, [messages]);

  const consumePrefill = useCallback(() => {
    setPrefillText("");
  }, []);

  // SSE event handler for message-related events
  const handleMessageEvent = useCallback((event: Event) => {
    switch (event.type) {
      case "message.updated": {
        const info = event.properties.info as Message;
        // pendingShell が true のとき、user / assistant メッセージ両方をシェルとしてタグ付けする。
        // user メッセージは吹き出しを非表示にするため、assistant メッセージは ShellResultView 表示に使う。
        if (pendingShell.current) {
          if (info.role === "user" || info.role === "assistant") {
            setShellMessageIds((prev) => new Set(prev).add(info.id));
          }
          // assistant が到着したらフラグをクリアする
          if (info.role === "assistant") {
            pendingShell.current = false;
          }
        }
        setMessages((prev) => upsertMessage(prev, info));
        break;
      }
      case "message.part.updated":
        setMessages((prev) => upsertPart(prev, event.properties.part));
        break;
      case "message.removed":
        setMessages((prev) => removeMessage(prev, event.properties.messageID));
        break;
    }
  }, []);

  return {
    messages,
    setMessages,
    prefillText,
    setPrefillText,
    inputTokens,
    latestTodos,
    consumePrefill,
    handleMessageEvent,
    markPendingShell,
    isShellMessage,
  } as const;
}
