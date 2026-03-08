import type { AgentEvent, ChatSession } from "@opencodegui/core";
import { act, renderHook } from "@testing-library/react";
import { createRef, type RefObject } from "react";
import { describe, expect, it } from "vitest";
import { type MessageWithParts, useMessages } from "../../hooks/useMessages";

/** activeSessionRef のヘルパー。指定セッションを current に持つ RefObject を返す */
function createSessionRef(session: ChatSession | null = null): RefObject<ChatSession | null> {
  const ref = createRef<ChatSession | null>() as { current: ChatSession | null };
  ref.current = session;
  return ref;
}

/** テスト用の最小限のセッションオブジェクトを生成する */
function fakeSession(id: string): ChatSession {
  return { id, title: "", time: { created: 0, updated: 0 } };
}

describe("useMessages", () => {
  // initial state
  context("初期状態の場合", () => {
    // messages is empty
    it("messages が空配列であること", () => {
      const { result } = renderHook(() => useMessages(createSessionRef()));
      expect(result.current.messages).toEqual([]);
    });

    // prefillText is empty
    it("prefillText が空文字であること", () => {
      const { result } = renderHook(() => useMessages(createSessionRef()));
      expect(result.current.prefillText).toBe("");
    });
  });

  // setMessages
  context("setMessages で直接設定した場合", () => {
    // sets messages
    it("messages が設定されること", () => {
      const { result } = renderHook(() => useMessages(createSessionRef()));
      const msg = { info: { id: "m1" }, parts: [] } as unknown as MessageWithParts;
      act(() => result.current.setMessages([msg]));
      expect(result.current.messages).toHaveLength(1);
    });
  });

  // prefill management
  context("setPrefillText で値を設定した場合", () => {
    // consumePrefill clears the text
    it("consumePrefill で空文字にリセットされること", () => {
      const { result } = renderHook(() => useMessages(createSessionRef()));
      act(() => result.current.setPrefillText("hello"));
      act(() => result.current.consumePrefill());
      expect(result.current.prefillText).toBe("");
    });
  });

  // handleMessageEvent for message.updated
  context("message.updated イベントを受信した場合", () => {
    // adds new message when not existing
    it("新しいメッセージを追加すること", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      const event = {
        type: "message.updated",
        properties: { info: { id: "m1", role: "user", sessionID: "s1" } },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages).toHaveLength(1);
    });

    // updates existing message info
    it("既存メッセージの info を更新すること", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      const msg: MessageWithParts = { info: { id: "m1", role: "user", sessionID: "s1" } as any, parts: [] };
      act(() => result.current.setMessages([msg]));
      const event = {
        type: "message.updated",
        properties: { info: { id: "m1", role: "user", sessionID: "s1", metadata: { summary: "updated" } } },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect((result.current.messages[0].info as any).metadata.summary).toBe("updated");
    });
  });

  // handleMessageEvent for message.part.updated
  context("message.part.updated イベントを受信した場合", () => {
    // adds new part to existing message
    it("既存メッセージに新しいパートを追加すること", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      const msg: MessageWithParts = { info: { id: "m1" } as any, parts: [] };
      act(() => result.current.setMessages([msg]));
      const event = {
        type: "message.part.updated",
        properties: {
          sessionID: "s1",
          part: { id: "p1", sessionID: "s1", messageID: "m1", type: "text", text: "hello" },
        },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages[0].parts).toHaveLength(1);
    });

    // updates existing part in message
    it("既存パートを更新すること", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      const msg: MessageWithParts = {
        info: { id: "m1" } as any,
        parts: [{ id: "p1", sessionID: "s1", messageID: "m1", type: "text", text: "old" } as any],
      };
      act(() => result.current.setMessages([msg]));
      const event = {
        type: "message.part.updated",
        properties: {
          sessionID: "s1",
          part: { id: "p1", sessionID: "s1", messageID: "m1", type: "text", text: "new" },
        },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect((result.current.messages[0].parts[0] as any).text).toBe("new");
    });
  });

  // handleMessageEvent for message.removed
  context("message.removed イベントを受信した場合", () => {
    // removes the message
    it("該当メッセージを削除すること", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      const msgs: MessageWithParts[] = [
        { info: { id: "m1" } as any, parts: [] },
        { info: { id: "m2" } as any, parts: [] },
      ];
      act(() => result.current.setMessages(msgs));
      const event = {
        type: "message.removed",
        properties: { sessionID: "s1", messageID: "m1" },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages).toHaveLength(1);
    });
  });

  // markPendingShell and isShellMessage
  context("markPendingShell を呼び出した場合", () => {
    // tags next assistant message as shell
    it("次の assistant メッセージがシェルメッセージとしてタグ付けされること", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      act(() => result.current.markPendingShell());
      const event = {
        type: "message.updated",
        properties: { info: { id: "shell-a1", role: "assistant", sessionID: "s1" } },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.isShellMessage("shell-a1")).toBe(true);
    });

    // tags user message as shell
    it("user メッセージもシェルメッセージとしてタグ付けされること", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      act(() => result.current.markPendingShell());
      const event = {
        type: "message.updated",
        properties: { info: { id: "shell-u1", role: "user", sessionID: "s1" } },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.isShellMessage("shell-u1")).toBe(true);
    });

    // clears pending flag after assistant message
    it("assistant メッセージ後にフラグがクリアされること", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      act(() => result.current.markPendingShell());
      // user message arrives first
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "u1", role: "user", sessionID: "s1" } },
        } as unknown as AgentEvent),
      );
      // assistant message arrives and clears the flag
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "a1", role: "assistant", sessionID: "s1" } },
        } as unknown as AgentEvent),
      );
      // next message should NOT be tagged
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "a2", role: "assistant", sessionID: "s1" } },
        } as unknown as AgentEvent),
      );
      expect(result.current.isShellMessage("a2")).toBe(false);
    });

    // does not clear pending flag on user message alone
    it("user メッセージだけではフラグがクリアされないこと", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      act(() => result.current.markPendingShell());
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "u1", role: "user", sessionID: "s1" } },
        } as unknown as AgentEvent),
      );
      // next assistant should still be tagged
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "a1", role: "assistant", sessionID: "s1" } },
        } as unknown as AgentEvent),
      );
      expect(result.current.isShellMessage("a1")).toBe(true);
    });
  });

  // isShellMessage returns false for normal messages
  context("markPendingShell を呼び出していない場合", () => {
    // returns false for normal messages
    it("通常メッセージの isShellMessage が false を返すこと", () => {
      const ref = createSessionRef(fakeSession("s1"));
      const { result } = renderHook(() => useMessages(ref));
      const event = {
        type: "message.updated",
        properties: { info: { id: "m1", role: "assistant", sessionID: "s1" } },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.isShellMessage("m1")).toBe(false);
    });
  });

  // Session ID filtering — サブエージェント（子セッション）のイベントが親に混入しない
  context("子セッションのイベントを受信した場合", () => {
    it("message.updated: 別セッションのメッセージが追加されないこと", () => {
      const ref = createSessionRef(fakeSession("parent-session"));
      const { result } = renderHook(() => useMessages(ref));
      const event = {
        type: "message.updated",
        properties: { info: { id: "m-child", role: "assistant", sessionID: "child-session" } },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages).toHaveLength(0);
    });

    it("message.part.updated: 別セッションのパートが追加されないこと", () => {
      const ref = createSessionRef(fakeSession("parent-session"));
      const { result } = renderHook(() => useMessages(ref));
      // まず親セッションのメッセージを追加する
      const msg: MessageWithParts = { info: { id: "m1" } as any, parts: [] };
      act(() => result.current.setMessages([msg]));
      // 子セッションのパートイベントが来ても追加されない
      const event = {
        type: "message.part.updated",
        properties: {
          sessionID: "child-session",
          part: { id: "p1", sessionID: "child-session", messageID: "m1", type: "text", text: "leak" },
        },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages[0].parts).toHaveLength(0);
    });

    it("message.removed: 別セッションの削除イベントが無視されること", () => {
      const ref = createSessionRef(fakeSession("parent-session"));
      const { result } = renderHook(() => useMessages(ref));
      const msgs: MessageWithParts[] = [{ info: { id: "m1" } as any, parts: [] }];
      act(() => result.current.setMessages(msgs));
      const event = {
        type: "message.removed",
        properties: { sessionID: "child-session", messageID: "m1" },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages).toHaveLength(1);
    });
  });

  // activeSession が null の場合はフィルタリングをスキップする（全イベントを受け入れる）
  context("activeSession が null の場合", () => {
    it("message.updated: セッション未設定でもメッセージが追加されること", () => {
      const ref = createSessionRef(null);
      const { result } = renderHook(() => useMessages(ref));
      const event = {
        type: "message.updated",
        properties: { info: { id: "m1", role: "user", sessionID: "any-session" } },
      } as unknown as AgentEvent;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages).toHaveLength(1);
    });
  });
});
