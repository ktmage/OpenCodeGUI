import type { Event, FileDiff } from "@opencode-ai/sdk";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFileChanges } from "../../hooks/useFileChanges";

function createFileDiff(overrides: Partial<FileDiff> = {}): FileDiff {
  return {
    file: "src/index.ts",
    before: "const a = 1;",
    after: "const a = 2;",
    additions: 1,
    deletions: 1,
    ...overrides,
  };
}

describe("useFileChanges", () => {
  // initial state
  context("初期状態の場合", () => {
    // diffs is empty
    it("diffs が空配列であること", () => {
      const { result } = renderHook(() => useFileChanges());
      expect(result.current.diffs).toEqual([]);
    });
  });

  // setDiffs
  context("setDiffs を呼んだ場合", () => {
    // updates diffs state
    it("diffs が更新されること", () => {
      const { result } = renderHook(() => useFileChanges());
      const diff = createFileDiff();
      act(() => result.current.setDiffs([diff]));
      expect(result.current.diffs).toEqual([diff]);
    });
  });

  // clearDiffs
  context("clearDiffs を呼んだ場合", () => {
    // clears diffs
    it("diffs が空になること", () => {
      const { result } = renderHook(() => useFileChanges());
      act(() => result.current.setDiffs([createFileDiff()]));
      act(() => result.current.clearDiffs());
      expect(result.current.diffs).toEqual([]);
    });
  });

  // handleFileChangeEvent
  context("session.diff イベントを受け取った場合", () => {
    // updates diffs from event
    it("イベントの diff データで diffs を更新すること", () => {
      const { result } = renderHook(() => useFileChanges());
      const diff = createFileDiff({ file: "updated.ts", additions: 10, deletions: 3 });
      const event = {
        type: "session.diff",
        properties: { sessionID: "s1", diff: [diff] },
      } as unknown as Event;
      act(() => result.current.handleFileChangeEvent(event));
      expect(result.current.diffs).toEqual([diff]);
    });
  });

  // ignores unrelated events
  context("関係ないイベントを受け取った場合", () => {
    // does not change diffs
    it("diffs が変更されないこと", () => {
      const { result } = renderHook(() => useFileChanges());
      const event = {
        type: "message.updated",
        properties: {},
      } as unknown as Event;
      act(() => result.current.handleFileChangeEvent(event));
      expect(result.current.diffs).toEqual([]);
    });
  });
});
