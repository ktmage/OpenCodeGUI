import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** sessionDiff メッセージでファイル変更差分を送信する */
async function sendSessionDiff(
  sessionId: string,
  diffs: Array<{ file: string; before: string; after: string; additions: number; deletions: number }>,
) {
  await sendExtMessage({
    type: "sessionDiff",
    sessionId,
    diffs,
  });
}

/** アクティブセッションとファイル変更差分をセットアップする */
async function setupWithDiffs(
  diffs: Array<{ file: string; before: string; after: string; additions: number; deletions: number }>,
) {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
  await sendSessionDiff("s1", diffs);
}

// File changes diff display
describe("ファイル変更差分表示", () => {
  // FileChangesHeader is shown when sessionDiff arrives
  context("sessionDiff メッセージを受信した場合", () => {
    beforeEach(async () => {
      await setupWithDiffs([
        { file: "src/index.ts", before: "const a = 1;", after: "const a = 2;", additions: 1, deletions: 1 },
        { file: "src/utils.ts", before: "", after: "export const b = 2;", additions: 1, deletions: 0 },
      ]);
    });

    // Shows File Changes label
    it("File Changes ラベルが表示されること", () => {
      expect(screen.getByText("File Changes")).toBeInTheDocument();
    });

    // Shows file count
    it("ファイル数が表示されること", () => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  // FileChangesHeader is hidden when there are no diffs
  context("ファイル変更がない場合", () => {
    // does not show FileChangesHeader
    it("FileChangesHeader が表示されないこと", async () => {
      renderApp();
      await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
      expect(screen.queryByText("File Changes")).not.toBeInTheDocument();
    });
  });

  // Expanding shows file details
  context("FileChangesHeader を展開した場合", () => {
    beforeEach(async () => {
      await setupWithDiffs([{ file: "src/app.ts", before: "old code", after: "new code", additions: 1, deletions: 1 }]);
      const user = userEvent.setup();
      await user.click(screen.getByTitle("File changes"));
    });

    // Shows file name
    it("ファイル名が表示されること", () => {
      expect(screen.getByText("app.ts")).toBeInTheDocument();
    });

    // Shows directory
    it("ディレクトリパスが表示されること", () => {
      expect(screen.getByText("src")).toBeInTheDocument();
    });
  });

  // sessionDiff for a different session is ignored
  context("異なるセッションの sessionDiff を受信した場合", () => {
    // does not show FileChangesHeader
    it("FileChangesHeader が表示されないこと", async () => {
      renderApp();
      await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
      await sendSessionDiff("other-session", [
        { file: "src/x.ts", before: "", after: "code", additions: 1, deletions: 0 },
      ]);
      expect(screen.queryByText("File Changes")).not.toBeInTheDocument();
    });
  });

  // Diffs are cleared when switching to a null session
  context("セッションが null に切り替わった場合", () => {
    // hides FileChangesHeader
    it("FileChangesHeader が非表示になること", async () => {
      await setupWithDiffs([{ file: "src/a.ts", before: "a", after: "b", additions: 1, deletions: 1 }]);
      expect(screen.getByText("File Changes")).toBeInTheDocument();

      await sendExtMessage({ type: "activeSession", session: null as any });
      expect(screen.queryByText("File Changes")).not.toBeInTheDocument();
    });
  });

  // session.diff SSE event updates the diff display
  context("session.diff SSE イベントを受信した場合", () => {
    // updates the file count
    it("ファイル数が更新されること", async () => {
      renderApp();
      await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

      // 最初はファイル変更なし
      expect(screen.queryByText("File Changes")).not.toBeInTheDocument();

      // SSE event で差分を受信
      await sendExtMessage({
        type: "event",
        event: {
          type: "session.diff",
          properties: {
            sessionID: "s1",
            diff: [{ file: "src/a.ts", before: "x", after: "y", additions: 1, deletions: 1 }],
          },
        } as any,
      });

      expect(screen.getByText("File Changes")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  // Inline diff is shown when file item is expanded
  context("ファイルアイテムを展開した場合", () => {
    // shows diff view with changed lines
    it("変更行を含む差分ビューが表示されること", async () => {
      await setupWithDiffs([
        { file: "src/main.ts", before: "const x = 1;", after: "const x = 2;", additions: 1, deletions: 1 },
      ]);
      const user = userEvent.setup();

      // ヘッダーバーを展開
      await user.click(screen.getByTitle("File changes"));

      // ファイルアイテムをクリックして差分を表示
      const fileHeader = document.querySelector(".fileHeader")!;
      await user.click(fileHeader);

      expect(screen.getByTestId("diff-view")).toBeInTheDocument();
    });
  });

  // Open diff editor button sends message
  context("差分エディタを開くボタンをクリックした場合", () => {
    // sends openDiffEditor message
    it("openDiffEditor メッセージが送信されること", async () => {
      await setupWithDiffs([{ file: "src/main.ts", before: "before", after: "after", additions: 1, deletions: 1 }]);

      const mockPostMessage = vi.mocked(postMessage);
      mockPostMessage.mockClear();
      const user = userEvent.setup();

      // ヘッダーバーを展開
      await user.click(screen.getByTitle("File changes"));

      // 外部リンクボタンをクリック
      const openButton = document.querySelector(".openButton")!;
      await user.click(openButton);

      const diffCall = mockPostMessage.mock.calls.find((call) => call[0]?.type === "openDiffEditor");
      expect(diffCall).toBeTruthy();
    });
  });

  // Multiple files with summary stats
  context("複数ファイルの変更がある場合", () => {
    beforeEach(async () => {
      await setupWithDiffs([
        { file: "src/a.ts", before: "a", after: "aa", additions: 5, deletions: 2 },
        { file: "src/b.ts", before: "", after: "new", additions: 10, deletions: 0 },
        { file: "src/c.ts", before: "c", after: "", additions: 0, deletions: 8 },
      ]);
    });

    // Shows total file count
    it("合計ファイル数が表示されること", () => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    // Shows all files when expanded
    it("展開すると全ファイルが表示されること", async () => {
      const user = userEvent.setup();
      await user.click(screen.getByTitle("File changes"));

      expect(screen.getByText("a.ts")).toBeInTheDocument();
      expect(screen.getByText("b.ts")).toBeInTheDocument();
      expect(screen.getByText("c.ts")).toBeInTheDocument();
    });
  });
});
