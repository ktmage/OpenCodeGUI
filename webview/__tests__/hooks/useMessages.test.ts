import type { Event } from "@opencode-ai/sdk";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type MessageWithParts, useMessages } from "../../hooks/useMessages";

describe("useMessages", () => {
  // initial state
  context("初期状態の場合", () => {
    // messages is empty
    it("messages が空配列であること", () => {
      const { result } = renderHook(() => useMessages());
      expect(result.current.messages).toEqual([]);
    });

    // inputTokens is 0
    it("inputTokens が 0 であること", () => {
      const { result } = renderHook(() => useMessages());
      expect(result.current.inputTokens).toBe(0);
    });

    // latestTodos is empty
    it("latestTodos が空配列であること", () => {
      const { result } = renderHook(() => useMessages());
      expect(result.current.latestTodos).toEqual([]);
    });

    // prefillText is empty
    it("prefillText が空文字であること", () => {
      const { result } = renderHook(() => useMessages());
      expect(result.current.prefillText).toBe("");
    });
  });

  // setMessages
  context("setMessages で直接設定した場合", () => {
    // sets messages
    it("messages が設定されること", () => {
      const { result } = renderHook(() => useMessages());
      const msg = { info: { id: "m1" }, parts: [] } as unknown as MessageWithParts;
      act(() => result.current.setMessages([msg]));
      expect(result.current.messages).toHaveLength(1);
    });
  });

  // inputTokens derivation
  context("messages に step-finish パートがある場合", () => {
    // sums input tokens from step-finish parts
    it("inputTokens がトークン合計値を返すこと", () => {
      const { result } = renderHook(() => useMessages());
      const msgs: MessageWithParts[] = [
        {
          info: { id: "m1" } as any,
          parts: [
            { id: "p1", type: "step-finish", tokens: { input: 100, output: 50 } } as any,
            { id: "p2", type: "step-finish", tokens: { input: 200, output: 80 } } as any,
          ],
        },
      ];
      act(() => result.current.setMessages(msgs));
      expect(result.current.inputTokens).toBe(300);
    });
  });

  // prefill management
  context("setPrefillText で値を設定した場合", () => {
    // consumePrefill clears the text
    it("consumePrefill で空文字にリセットされること", () => {
      const { result } = renderHook(() => useMessages());
      act(() => result.current.setPrefillText("hello"));
      act(() => result.current.consumePrefill());
      expect(result.current.prefillText).toBe("");
    });
  });

  // handleMessageEvent for message.updated
  context("message.updated イベントを受信した場合", () => {
    // adds new message when not existing
    it("新しいメッセージを追加すること", () => {
      const { result } = renderHook(() => useMessages());
      const event = {
        type: "message.updated",
        properties: { info: { id: "m1", role: "user" } },
      } as unknown as Event;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages).toHaveLength(1);
    });

    // updates existing message info
    it("既存メッセージの info を更新すること", () => {
      const { result } = renderHook(() => useMessages());
      const msg: MessageWithParts = { info: { id: "m1", role: "user" } as any, parts: [] };
      act(() => result.current.setMessages([msg]));
      const event = {
        type: "message.updated",
        properties: { info: { id: "m1", role: "user", metadata: { summary: "updated" } } },
      } as unknown as Event;
      act(() => result.current.handleMessageEvent(event));
      expect((result.current.messages[0].info as any).metadata.summary).toBe("updated");
    });
  });

  // handleMessageEvent for message.part.updated
  context("message.part.updated イベントを受信した場合", () => {
    // adds new part to existing message
    it("既存メッセージに新しいパートを追加すること", () => {
      const { result } = renderHook(() => useMessages());
      const msg: MessageWithParts = { info: { id: "m1" } as any, parts: [] };
      act(() => result.current.setMessages([msg]));
      const event = {
        type: "message.part.updated",
        properties: { part: { id: "p1", messageID: "m1", type: "text", text: "hello" } },
      } as unknown as Event;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages[0].parts).toHaveLength(1);
    });

    // updates existing part in message
    it("既存パートを更新すること", () => {
      const { result } = renderHook(() => useMessages());
      const msg: MessageWithParts = {
        info: { id: "m1" } as any,
        parts: [{ id: "p1", messageID: "m1", type: "text", text: "old" } as any],
      };
      act(() => result.current.setMessages([msg]));
      const event = {
        type: "message.part.updated",
        properties: { part: { id: "p1", messageID: "m1", type: "text", text: "new" } },
      } as unknown as Event;
      act(() => result.current.handleMessageEvent(event));
      expect((result.current.messages[0].parts[0] as any).text).toBe("new");
    });
  });

  // handleMessageEvent for message.removed
  context("message.removed イベントを受信した場合", () => {
    // removes the message
    it("該当メッセージを削除すること", () => {
      const { result } = renderHook(() => useMessages());
      const msgs: MessageWithParts[] = [
        { info: { id: "m1" } as any, parts: [] },
        { info: { id: "m2" } as any, parts: [] },
      ];
      act(() => result.current.setMessages(msgs));
      const event = {
        type: "message.removed",
        properties: { messageID: "m1" },
      } as unknown as Event;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.messages).toHaveLength(1);
    });
  });

  // markPendingShell and isShellMessage
  context("markPendingShell を呼び出した場合", () => {
    // tags next assistant message as shell
    it("次の assistant メッセージがシェルメッセージとしてタグ付けされること", () => {
      const { result } = renderHook(() => useMessages());
      act(() => result.current.markPendingShell());
      const event = {
        type: "message.updated",
        properties: { info: { id: "shell-a1", role: "assistant" } },
      } as unknown as Event;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.isShellMessage("shell-a1")).toBe(true);
    });

    // tags user message as shell
    it("user メッセージもシェルメッセージとしてタグ付けされること", () => {
      const { result } = renderHook(() => useMessages());
      act(() => result.current.markPendingShell());
      const event = {
        type: "message.updated",
        properties: { info: { id: "shell-u1", role: "user" } },
      } as unknown as Event;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.isShellMessage("shell-u1")).toBe(true);
    });

    // clears pending flag after assistant message
    it("assistant メッセージ後にフラグがクリアされること", () => {
      const { result } = renderHook(() => useMessages());
      act(() => result.current.markPendingShell());
      // user message arrives first
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "u1", role: "user" } },
        } as unknown as Event),
      );
      // assistant message arrives and clears the flag
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "a1", role: "assistant" } },
        } as unknown as Event),
      );
      // next message should NOT be tagged
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "a2", role: "assistant" } },
        } as unknown as Event),
      );
      expect(result.current.isShellMessage("a2")).toBe(false);
    });

    // does not clear pending flag on user message alone
    it("user メッセージだけではフラグがクリアされないこと", () => {
      const { result } = renderHook(() => useMessages());
      act(() => result.current.markPendingShell());
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "u1", role: "user" } },
        } as unknown as Event),
      );
      // next assistant should still be tagged
      act(() =>
        result.current.handleMessageEvent({
          type: "message.updated",
          properties: { info: { id: "a1", role: "assistant" } },
        } as unknown as Event),
      );
      expect(result.current.isShellMessage("a1")).toBe(true);
    });
  });

  // isShellMessage returns false for normal messages
  context("markPendingShell を呼び出していない場合", () => {
    // returns false for normal messages
    it("通常メッセージの isShellMessage が false を返すこと", () => {
      const { result } = renderHook(() => useMessages());
      const event = {
        type: "message.updated",
        properties: { info: { id: "m1", role: "assistant" } },
      } as unknown as Event;
      act(() => result.current.handleMessageEvent(event));
      expect(result.current.isShellMessage("m1")).toBe(false);
    });
  });

  // latestTodos derivation
  context("messages に todowrite ツールの完了出力がある場合", () => {
    // parses todos from completed tool output
    it("latestTodos にパース結果を返すこと", () => {
      const { result } = renderHook(() => useMessages());
      const msgs: MessageWithParts[] = [
        {
          info: { id: "m1" } as any,
          parts: [
            {
              id: "p1",
              messageID: "m1",
              type: "tool",
              tool: "todowrite",
              state: {
                status: "completed",
                output: JSON.stringify([{ content: "task1", status: "done" }]),
                input: {},
              },
            } as any,
          ],
        },
      ];
      act(() => result.current.setMessages(msgs));
      expect(result.current.latestTodos).toEqual([{ content: "task1", status: "done" }]);
    });
  });
});
