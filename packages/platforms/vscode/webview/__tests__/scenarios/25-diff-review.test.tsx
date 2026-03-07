/**
 * Diff Review シナリオテスト。
 * difitAvailable メッセージ受信後の UI 表示と操作を検証する。
 */
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** difitAvailable + sessionDiff をセットアップする */
async function setupWithDifitAndDiffs(
  difitAvailable: boolean,
  diffs: Array<{ file: string; before: string; after: string; additions: number; deletions: number }>,
) {
  renderApp();
  await sendExtMessage({ type: "difitAvailable", available: difitAvailable });
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
  await sendExtMessage({ type: "sessionDiff", sessionId: "s1", diffs });
}

// Diff Review feature
describe("Diff Review 機能", () => {
  // --- FileChangesHeader review-all button ---

  context("difitAvailable=true かつファイル差分がある場合", () => {
    beforeEach(async () => {
      await setupWithDifitAndDiffs(true, [
        { file: "src/index.ts", before: "old", after: "new", additions: 1, deletions: 1 },
      ]);
    });

    // shows Diff Review button in FileChangesHeader bar
    it("FileChangesHeader に Diff Review ボタンが表示されること", () => {
      expect(screen.getByTitle("Diff Review")).toBeInTheDocument();
    });

    // sends openDiffReview on button click
    it("ボタンクリックで openDiffReview メッセージが送信されること", async () => {
      const mockPostMessage = vi.mocked(postMessage);
      mockPostMessage.mockClear();
      const user = userEvent.setup();

      await user.click(screen.getByTitle("Diff Review"));

      expect(mockPostMessage).toHaveBeenCalledWith({ type: "openDiffReview" });
    });
  });

  context("difitAvailable=false の場合", () => {
    beforeEach(async () => {
      await setupWithDifitAndDiffs(false, [
        { file: "src/index.ts", before: "old", after: "new", additions: 1, deletions: 1 },
      ]);
    });

    // does not show Diff Review button
    it("Diff Review ボタンが表示されないこと", () => {
      expect(screen.queryByTitle("Diff Review")).not.toBeInTheDocument();
    });
  });

  // --- FileChangesHeader per-file review button ---

  context("difitAvailable=true で FileChangesHeader を展開した場合", () => {
    beforeEach(async () => {
      await setupWithDifitAndDiffs(true, [{ file: "src/app.ts", before: "a", after: "b", additions: 1, deletions: 1 }]);
      const user = userEvent.setup();
      await user.click(screen.getByTitle("File changes"));
    });

    // shows per-file review button
    it("ファイルごとのレビューボタンが表示されること", () => {
      expect(screen.getByTitle("Open in Diff Review")).toBeInTheDocument();
    });

    // sends openDiffReview with focusFile
    it("ボタンクリックで focusFile 付きメッセージが送信されること", async () => {
      const mockPostMessage = vi.mocked(postMessage);
      mockPostMessage.mockClear();
      const user = userEvent.setup();

      await user.click(screen.getByTitle("Open in Diff Review"));

      expect(mockPostMessage).toHaveBeenCalledWith({ type: "openDiffReview", focusFile: "src/app.ts" });
    });
  });

  context("difitAvailable=false で FileChangesHeader を展開した場合", () => {
    beforeEach(async () => {
      await setupWithDifitAndDiffs(false, [
        { file: "src/app.ts", before: "a", after: "b", additions: 1, deletions: 1 },
      ]);
      const user = userEvent.setup();
      await user.click(screen.getByTitle("File changes"));
    });

    // does not show per-file review button
    it("ファイルごとのレビューボタンが表示されないこと", () => {
      expect(screen.queryByTitle("Open in Diff Review")).not.toBeInTheDocument();
    });
  });
});
