import type { Event, FileDiff } from "@opencode-ai/sdk";
import { useCallback, useState } from "react";

/**
 * セッションレベルのファイル変更差分を管理するフック。
 *
 * SSE の `file.edited` / `session.diff` イベントに応じて差分データを更新し、
 * FileChangesHeader に提供する。
 */
export function useFileChanges() {
  const [diffs, setDiffs] = useState<FileDiff[]>([]);

  const clearDiffs = useCallback(() => {
    setDiffs([]);
  }, []);

  // SSE event handler for file-change-related events
  const handleFileChangeEvent = useCallback((event: Event) => {
    if (event.type === "session.diff") {
      setDiffs(event.properties.diff);
    }
  }, []);

  return {
    diffs,
    setDiffs,
    clearDiffs,
    handleFileChangeEvent,
  } as const;
}
