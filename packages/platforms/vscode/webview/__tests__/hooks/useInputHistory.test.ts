import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInputHistory } from "../../hooks/useInputHistory";
import { getPersistedState, setPersistedState } from "../../vscode-api";

const mockGetPersistedState = vi.mocked(getPersistedState);
const mockSetPersistedState = vi.mocked(setPersistedState);

describe("useInputHistory", () => {
  beforeEach(() => {
    mockGetPersistedState.mockReturnValue(undefined);
  });

  // --- addEntry ---
  context("addEntry を呼んだ場合", () => {
    it("テキストを履歴に追加して永続化すること", () => {
      const { result } = renderHook(() => useInputHistory());
      act(() => result.current.addEntry("hello"));
      expect(mockSetPersistedState).toHaveBeenCalledWith({ inputHistory: ["hello"] });
    });

    it("空白のみのテキストは追加しないこと", () => {
      const { result } = renderHook(() => useInputHistory());
      act(() => result.current.addEntry("   "));
      expect(mockSetPersistedState).not.toHaveBeenCalled();
    });

    it("テキストをトリムして保存すること", () => {
      const { result } = renderHook(() => useInputHistory());
      act(() => result.current.addEntry("  hello  "));
      expect(mockSetPersistedState).toHaveBeenCalledWith({ inputHistory: ["hello"] });
    });

    it("既存の履歴に追記すること", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["first"] });
      const { result } = renderHook(() => useInputHistory());
      act(() => result.current.addEntry("second"));
      expect(mockSetPersistedState).toHaveBeenCalledWith({ inputHistory: ["first", "second"] });
    });

    it("100件を超えたら古いものから削除すること", () => {
      const existing = Array.from({ length: 100 }, (_, i) => `msg-${i}`);
      mockGetPersistedState.mockReturnValue({ inputHistory: existing });
      const { result } = renderHook(() => useInputHistory());
      act(() => result.current.addEntry("new-msg"));
      const saved = mockSetPersistedState.mock.calls[0][0] as { inputHistory: string[] };
      expect(saved.inputHistory).toHaveLength(100);
      expect(saved.inputHistory[0]).toBe("msg-1"); // msg-0 が削除される
      expect(saved.inputHistory[99]).toBe("new-msg");
    });

    it("重複するテキストもそのまま追加すること", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["hello"] });
      const { result } = renderHook(() => useInputHistory());
      act(() => result.current.addEntry("hello"));
      expect(mockSetPersistedState).toHaveBeenCalledWith({ inputHistory: ["hello", "hello"] });
    });

    it("既存の localeSetting を保持したまま保存すること", () => {
      mockGetPersistedState.mockReturnValue({ localeSetting: "ja" });
      const { result } = renderHook(() => useInputHistory());
      act(() => result.current.addEntry("test"));
      expect(mockSetPersistedState).toHaveBeenCalledWith({
        localeSetting: "ja",
        inputHistory: ["test"],
      });
    });
  });

  // --- navigateUp ---
  context("navigateUp を呼んだ場合", () => {
    it("履歴が空なら null を返すこと", () => {
      const { result } = renderHook(() => useInputHistory());
      let entry: string | null = null;
      act(() => {
        entry = result.current.navigateUp("");
      });
      expect(entry).toBeNull();
    });

    it("最新の履歴エントリを返すこと", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["first", "second", "third"] });
      const { result } = renderHook(() => useInputHistory());
      let entry: string | null = null;
      act(() => {
        entry = result.current.navigateUp("current");
      });
      expect(entry).toBe("third");
    });

    it("連続して呼ぶと古い履歴を辿ること", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["first", "second", "third"] });
      const { result } = renderHook(() => useInputHistory());
      const entries: (string | null)[] = [];
      act(() => {
        entries.push(result.current.navigateUp("current"));
        entries.push(result.current.navigateUp("third"));
        entries.push(result.current.navigateUp("second"));
      });
      expect(entries).toEqual(["third", "second", "first"]);
    });

    it("最古の履歴を超えたら null を返すこと", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["only"] });
      const { result } = renderHook(() => useInputHistory());
      const entries: (string | null)[] = [];
      act(() => {
        entries.push(result.current.navigateUp("current"));
        entries.push(result.current.navigateUp("only"));
      });
      expect(entries).toEqual(["only", null]);
    });
  });

  // --- navigateDown ---
  context("navigateDown を呼んだ場合", () => {
    it("ナビゲーション中でなければ null を返すこと", () => {
      const { result } = renderHook(() => useInputHistory());
      let entry: string | null = null;
      act(() => {
        entry = result.current.navigateDown("");
      });
      expect(entry).toBeNull();
    });

    it("最新の履歴を超えたらドラフトを復元すること", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["first", "second"] });
      const { result } = renderHook(() => useInputHistory());
      let entry: string | null = null;
      act(() => {
        result.current.navigateUp("my draft"); // → "second"
        entry = result.current.navigateDown("second"); // → ドラフト
      });
      expect(entry).toBe("my draft");
    });

    it("履歴を前後にナビゲートできること", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["a", "b", "c"] });
      const { result } = renderHook(() => useInputHistory());
      const entries: (string | null)[] = [];
      act(() => {
        entries.push(result.current.navigateUp("draft")); // → "c"
        entries.push(result.current.navigateUp("c")); // → "b"
        entries.push(result.current.navigateUp("b")); // → "a"
        entries.push(result.current.navigateDown("a")); // → "b"
        entries.push(result.current.navigateDown("b")); // → "c"
        entries.push(result.current.navigateDown("c")); // → "draft"
      });
      expect(entries).toEqual(["c", "b", "a", "b", "c", "draft"]);
    });
  });

  // --- resetNavigation ---
  context("resetNavigation を呼んだ場合", () => {
    it("ナビゲーション状態をリセットして navigateDown が null を返すこと", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["a", "b"] });
      const { result } = renderHook(() => useInputHistory());
      let entry: string | null = null;
      act(() => {
        result.current.navigateUp("draft"); // → "b"
        result.current.resetNavigation();
        entry = result.current.navigateDown("anything");
      });
      expect(entry).toBeNull();
    });

    it("リセット後に再度 navigateUp したら最新から始まること", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["a", "b"] });
      const { result } = renderHook(() => useInputHistory());
      let entry: string | null = null;
      act(() => {
        result.current.navigateUp("draft1"); // → "b"
        result.current.navigateUp("b"); // → "a"
        result.current.resetNavigation();
        entry = result.current.navigateUp("draft2");
      });
      expect(entry).toBe("b");
    });
  });

  // --- addEntry 後のナビゲーションリセット ---
  context("addEntry の後に navigateDown を呼んだ場合", () => {
    it("ナビゲーション状態がリセットされて null を返すこと", () => {
      mockGetPersistedState.mockReturnValue({ inputHistory: ["a"] });
      const { result } = renderHook(() => useInputHistory());
      let entry: string | null = null;
      act(() => {
        result.current.navigateUp("draft");
        result.current.addEntry("new");
        entry = result.current.navigateDown("anything");
      });
      expect(entry).toBeNull();
    });
  });
});
