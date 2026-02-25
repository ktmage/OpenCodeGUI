import type { Event } from "@opencode-ai/sdk";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSession } from "../../hooks/useSession";
import { postMessage } from "../../vscode-api";

describe("useSession", () => {
  // session list management
  context("セッション一覧を管理する場合", () => {
    // sets sessions via setSessions
    it("setSessions でセッション一覧を設定できること", () => {
      const { result } = renderHook(() => useSession());
      const session = { id: "s1" } as any;
      act(() => result.current.setSessions([session]));
      expect(result.current.sessions).toEqual([session]);
    });

    // sets activeSession via setActiveSession
    it("setActiveSession でアクティブセッションを設定できること", () => {
      const { result } = renderHook(() => useSession());
      const session = { id: "s1" } as any;
      act(() => result.current.setActiveSession(session));
      expect(result.current.activeSession).toEqual(session);
    });
  });

  // handleNewSession action
  context("handleNewSession を呼んだ場合", () => {
    // sends createSession message
    it("createSession メッセージを送信すること", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.handleNewSession());
      expect(postMessage).toHaveBeenCalledWith({ type: "createSession" });
    });

    // closes session list
    it("セッションリストを閉じること", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.toggleSessionList());
      act(() => result.current.handleNewSession());
      expect(result.current.showSessionList).toBe(false);
    });
  });

  // handleSelectSession action
  context("handleSelectSession を呼んだ場合", () => {
    // sends selectSession message
    it("selectSession メッセージを送信すること", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.handleSelectSession("s1"));
      expect(postMessage).toHaveBeenCalledWith({ type: "selectSession", sessionId: "s1" });
    });

    // closes session list
    it("セッションリストを閉じること", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.toggleSessionList());
      act(() => result.current.handleSelectSession("s1"));
      expect(result.current.showSessionList).toBe(false);
    });
  });

  // handleDeleteSession action
  context("handleDeleteSession を呼んだ場合", () => {
    // sends deleteSession message
    it("deleteSession メッセージを送信すること", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.handleDeleteSession("s1"));
      expect(postMessage).toHaveBeenCalledWith({ type: "deleteSession", sessionId: "s1" });
    });
  });

  // toggleSessionList action
  context("toggleSessionList を呼んだ場合", () => {
    // toggles showSessionList
    it("showSessionList をトグルすること", () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.showSessionList).toBe(false);
      act(() => result.current.toggleSessionList());
      expect(result.current.showSessionList).toBe(true);
    });
  });

  // handleSessionEvent for session.status
  context("session.status イベントを受信した場合", () => {
    // sets sessionBusy to true when busy
    it("busy のとき sessionBusy が true になること", () => {
      const { result } = renderHook(() => useSession());
      const event = { type: "session.status", properties: { status: { type: "busy" } } } as unknown as Event;
      act(() => result.current.handleSessionEvent(event));
      expect(result.current.sessionBusy).toBe(true);
    });

    // sets sessionBusy to false when idle
    it("idle のとき sessionBusy が false になること", () => {
      const { result } = renderHook(() => useSession());
      const busyEvent = { type: "session.status", properties: { status: { type: "busy" } } } as unknown as Event;
      act(() => result.current.handleSessionEvent(busyEvent));
      const idleEvent = { type: "session.status", properties: { status: { type: "idle" } } } as unknown as Event;
      act(() => result.current.handleSessionEvent(idleEvent));
      expect(result.current.sessionBusy).toBe(false);
    });
  });

  // handleSessionEvent for session.updated
  context("session.updated イベントを受信した場合", () => {
    // updates matching session in sessions list
    it("sessions 内の該当セッションを更新すること", () => {
      const { result } = renderHook(() => useSession());
      const s1 = { id: "s1", title: "old" } as any;
      act(() => result.current.setSessions([s1]));
      const updated = { id: "s1", title: "new" } as any;
      const event = { type: "session.updated", properties: { info: updated } } as unknown as Event;
      act(() => result.current.handleSessionEvent(event));
      expect(result.current.sessions[0].title).toBe("new");
    });

    // updates activeSession if it matches
    it("アクティブセッションが該当する場合は更新すること", () => {
      const { result } = renderHook(() => useSession());
      const s1 = { id: "s1", title: "old" } as any;
      act(() => result.current.setActiveSession(s1));
      const updated = { id: "s1", title: "new" } as any;
      const event = { type: "session.updated", properties: { info: updated } } as unknown as Event;
      act(() => result.current.handleSessionEvent(event));
      expect(result.current.activeSession?.title).toBe("new");
    });
  });

  // handleSessionEvent for session.created
  context("session.created イベントを受信した場合", () => {
    // prepends new session to sessions list
    it("sessions の先頭に新しいセッションを追加すること", () => {
      const { result } = renderHook(() => useSession());
      const existing = { id: "s1" } as any;
      act(() => result.current.setSessions([existing]));
      const newSession = { id: "s2" } as any;
      const event = { type: "session.created", properties: { info: newSession } } as unknown as Event;
      act(() => result.current.handleSessionEvent(event));
      expect(result.current.sessions[0].id).toBe("s2");
    });
  });

  // handleSessionEvent for session.deleted
  context("session.deleted イベントを受信した場合", () => {
    // removes the deleted session from sessions list
    it("sessions から該当セッションを削除すること", () => {
      const { result } = renderHook(() => useSession());
      const s1 = { id: "s1" } as any;
      const s2 = { id: "s2" } as any;
      act(() => result.current.setSessions([s1, s2]));
      const event = { type: "session.deleted", properties: { info: { id: "s1" } } } as unknown as Event;
      act(() => result.current.handleSessionEvent(event));
      expect(result.current.sessions).toHaveLength(1);
    });
  });
});
