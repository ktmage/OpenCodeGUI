import type { AgentEvent } from "@opencodegui/core";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSoundNotification } from "../../hooks/useSoundNotification";
import { getPersistedState, setPersistedState } from "../../vscode-api";

describe("useSoundNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPersistedState).mockReturnValue(undefined);
  });

  // initial state
  context("初期状態の場合", () => {
    // sound settings is empty object
    it("soundSettings が空オブジェクトであること", () => {
      const { result } = renderHook(() => useSoundNotification());
      expect(result.current.soundSettings).toEqual({});
    });
  });

  // initial state from persisted state
  context("永続化済みの設定がある場合", () => {
    // loads settings from persisted state
    it("永続化された設定が読み込まれること", () => {
      vi.mocked(getPersistedState).mockReturnValue({
        soundSettings: { error: { enabled: false, volume: 0.3 } },
      });
      const { result } = renderHook(() => useSoundNotification());
      expect(result.current.soundSettings).toEqual({ error: { enabled: false, volume: 0.3 } });
    });
  });

  // handleSoundSettingChange
  context("handleSoundSettingChange を呼んだ場合", () => {
    // updates settings
    it("設定が更新されること", () => {
      const { result } = renderHook(() => useSoundNotification());
      act(() => result.current.handleSoundSettingChange("error", { enabled: false }));
      expect(result.current.soundSettings.error?.enabled).toBe(false);
    });

    // persists to state
    it("永続化されること", () => {
      const { result } = renderHook(() => useSoundNotification());
      act(() => result.current.handleSoundSettingChange("responseComplete", { volume: 0.8 }));
      expect(setPersistedState).toHaveBeenCalledWith(
        expect.objectContaining({
          soundSettings: { responseComplete: { volume: 0.8 } },
        }),
      );
    });
  });

  // session.status busy → idle triggers responseComplete
  context("session.status が busy → idle に遷移した場合", () => {
    // plays sound
    it("AudioContext が生成されること（サウンド再生）", () => {
      const { result } = renderHook(() => useSoundNotification());

      // busy にする
      act(() => {
        result.current.handleSoundEvent({
          type: "session.status",
          properties: { sessionID: "s1", status: { type: "busy" } },
        } as unknown as AgentEvent);
      });

      // idle にする（busy → idle 遷移）
      act(() => {
        result.current.handleSoundEvent({
          type: "session.status",
          properties: { sessionID: "s1", status: { type: "idle" } },
        } as unknown as AgentEvent);
      });

      expect(AudioContext).toHaveBeenCalled();
    });
  });

  // session.status idle → idle does not trigger
  context("session.status が idle → idle の場合", () => {
    // does not play sound
    it("サウンドが再生されないこと", () => {
      const { result } = renderHook(() => useSoundNotification());

      act(() => {
        result.current.handleSoundEvent({
          type: "session.status",
          properties: { sessionID: "s1", status: { type: "idle" } },
        } as unknown as AgentEvent);
      });

      expect(AudioContext).not.toHaveBeenCalled();
    });
  });

  // permission.updated triggers permissionRequest
  context("permission.updated イベントを受信した場合", () => {
    // plays sound
    it("サウンドが再生されること", () => {
      const { result } = renderHook(() => useSoundNotification());

      act(() => {
        result.current.handleSoundEvent({
          type: "permission.updated",
          properties: { id: "perm1", title: "allow bash" },
        } as unknown as AgentEvent);
      });

      expect(AudioContext).toHaveBeenCalled();
    });
  });

  // session.error triggers error
  context("session.error イベントを受信した場合", () => {
    // plays sound
    it("サウンドが再生されること", () => {
      const { result } = renderHook(() => useSoundNotification());

      act(() => {
        result.current.handleSoundEvent({
          type: "session.error",
          properties: { sessionID: "s1", error: "something failed" },
        } as unknown as AgentEvent);
      });

      expect(AudioContext).toHaveBeenCalled();
    });
  });

  // disabled event does not play sound
  context("イベントが無効の場合", () => {
    // does not play sound
    it("サウンドが再生されないこと", () => {
      vi.mocked(getPersistedState).mockReturnValue({
        soundSettings: { permissionRequest: { enabled: false } },
      });
      const { result } = renderHook(() => useSoundNotification());

      act(() => {
        result.current.handleSoundEvent({
          type: "permission.updated",
          properties: { id: "perm1", title: "allow bash" },
        } as unknown as AgentEvent);
      });

      expect(AudioContext).not.toHaveBeenCalled();
    });
  });

  // unrelated events do not trigger
  context("無関係なイベントを受信した場合", () => {
    // does not play sound
    it("サウンドが再生されないこと", () => {
      const { result } = renderHook(() => useSoundNotification());

      act(() => {
        result.current.handleSoundEvent({
          type: "session.updated",
          properties: { info: {} },
        } as unknown as AgentEvent);
      });

      expect(AudioContext).not.toHaveBeenCalled();
    });
  });
});
