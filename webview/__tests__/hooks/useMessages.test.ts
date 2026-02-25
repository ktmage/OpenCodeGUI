import type { Event } from "@opencode-ai/sdk";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useMessages, type MessageWithParts } from "../../hooks/useMessages";

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
