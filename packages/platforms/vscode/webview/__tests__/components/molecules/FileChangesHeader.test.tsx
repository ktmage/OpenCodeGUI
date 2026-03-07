import type { FileDiff } from "@opencodegui/core";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileChangesHeader } from "../../../components/molecules/FileChangesHeader";
import { postMessage } from "../../../vscode-api";

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

describe("FileChangesHeader", () => {
  const defaultProps = {
    diffs: [createFileDiff()],
    onOpenDiffEditor: vi.fn(),
    difitAvailable: false,
  };

  // default rendering
  context("デフォルトの描画の場合", () => {
    // renders the header bar
    it("ヘッダーバーをレンダリングすること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      expect(container.querySelector(".bar")).toBeInTheDocument();
    });

    // shows file count
    it("ファイル数を表示すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      expect(container.querySelector(".count")?.textContent).toBe("1");
    });

    // shows additions and deletions stats
    it("追加・削除の統計を表示すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      const addStat = container.querySelector(".statAdd");
      const removeStat = container.querySelector(".statRemove");
      expect(addStat?.textContent).toBe("+1");
      expect(removeStat?.textContent).toBe("−1");
    });

    // list is collapsed by default
    it("リストはデフォルトで折りたたまれていること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      expect(container.querySelector(".list")).not.toBeInTheDocument();
    });
  });

  // when header is clicked
  context("ヘッダーをクリックした場合", () => {
    // expands the file list
    it("ファイルリストを展開すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelector(".list")).toBeInTheDocument();
    });

    // shows file name
    it("ファイル名を表示すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      fireEvent.click(container.querySelector(".bar")!);
      const fileName = container.querySelector(".fileName");
      expect(fileName?.textContent).toBe("index.ts");
    });

    // shows status badge M for modified file
    it("変更ファイルにステータスバッジ M を表示すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      fireEvent.click(container.querySelector(".bar")!);
      const badge = container.querySelector(".statusBadge");
      expect(badge?.textContent).toBe("M");
    });
  });

  // added file
  context("新規追加ファイルの場合", () => {
    // renders status badge A
    it("ステータスバッジ A を表示すること", () => {
      const diffs = [createFileDiff({ before: "", after: "new content", file: "new.ts" })];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      fireEvent.click(container.querySelector(".bar")!);
      const badge = container.querySelector(".statusBadge");
      expect(badge?.textContent).toBe("A");
    });
  });

  // deleted file
  context("削除ファイルの場合", () => {
    // renders status badge D
    it("ステータスバッジ D を表示すること", () => {
      const diffs = [createFileDiff({ before: "old content", after: "", file: "deleted.ts" })];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      fireEvent.click(container.querySelector(".bar")!);
      const badge = container.querySelector(".statusBadge");
      expect(badge?.textContent).toBe("D");
    });
  });

  // expand inline diff
  context("ファイルアイテムをクリックした場合", () => {
    // shows inline diff view
    it("インライン差分ビューを表示すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      fireEvent.click(container.querySelector(".bar")!);
      const fileHeader = container.querySelector(".fileHeader");
      fireEvent.click(fileHeader!);
      expect(screen.getByTestId("diff-view")).toBeTruthy();
    });
  });

  // multiple files
  context("複数ファイルがある場合", () => {
    // renders all files
    it("全ファイルを表示すること", () => {
      const diffs = [
        createFileDiff({ file: "src/a.ts" }),
        createFileDiff({ file: "src/b.ts" }),
        createFileDiff({ file: "src/c.ts" }),
      ];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      fireEvent.click(container.querySelector(".bar")!);
      const fileItems = container.querySelectorAll(".fileItem");
      expect(fileItems.length).toBe(3);
    });

    // shows correct total stats in header
    it("ヘッダーに合計の追加・削除数を表示すること", () => {
      const diffs = [
        createFileDiff({ file: "a.ts", additions: 3, deletions: 1 }),
        createFileDiff({ file: "b.ts", additions: 5, deletions: 2 }),
      ];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      const stats = container.querySelector(".stats");
      expect(stats?.textContent).toContain("+8");
      expect(stats?.textContent).toContain("−3");
    });
  });

  // directory path display
  context("ディレクトリパスがある場合", () => {
    // shows directory path
    it("ディレクトリパスを表示すること", () => {
      const diffs = [createFileDiff({ file: "src/components/Button.tsx" })];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      fireEvent.click(container.querySelector(".bar")!);
      const filePath = container.querySelector(".filePath");
      expect(filePath?.textContent).toBe("src/components");
    });
  });

  // open diff editor
  context("外部リンクボタンをクリックした場合", () => {
    // calls onOpenDiffEditor
    it("onOpenDiffEditor が呼ばれること", () => {
      const onOpenDiffEditor = vi.fn();
      const diff = createFileDiff({ file: "src/app.ts", before: "old", after: "new" });
      const { container } = render(<FileChangesHeader diffs={[diff]} onOpenDiffEditor={onOpenDiffEditor} />);
      fireEvent.click(container.querySelector(".bar")!);
      const openButton = container.querySelector(".openButton");
      fireEvent.click(openButton!);
      expect(onOpenDiffEditor).toHaveBeenCalledWith("src/app.ts", "old", "new");
    });

    // does not toggle file expansion
    it("ファイルの展開がトグルされないこと", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      fireEvent.click(container.querySelector(".bar")!);
      const openButton = container.querySelector(".openButton");
      fireEvent.click(openButton!);
      expect(container.querySelector(".diffBody")).not.toBeInTheDocument();
    });
  });

  // toggle collapse
  context("ヘッダーを2回クリックした場合", () => {
    // collapses the file list
    it("ファイルリストが折りたたまれること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelector(".list")).toBeInTheDocument();
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelector(".list")).not.toBeInTheDocument();
    });
  });

  // chevron rotation
  context("展開時のシェブロンの場合", () => {
    // applies expanded class to chevron
    it("chevron に expanded クラスが付与されること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelector(".chevron")).toHaveClass("expanded");
    });
  });

  // no directory path for root-level file
  context("ルートレベルのファイルの場合", () => {
    // does not show directory path
    it("ディレクトリパスが表示されないこと", () => {
      const diffs = [createFileDiff({ file: "README.md" })];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelector(".filePath")).not.toBeInTheDocument();
    });
  });

  // zero additions/deletions
  context("追加・削除が 0 の場合", () => {
    // does not show addition stat
    it("追加統計が表示されないこと", () => {
      const diffs = [createFileDiff({ additions: 0, deletions: 3 })];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      expect(container.querySelector(".statAdd")).not.toBeInTheDocument();
    });

    // does not show deletion stat
    it("削除統計が表示されないこと", () => {
      const diffs = [createFileDiff({ additions: 5, deletions: 0 })];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      expect(container.querySelector(".statRemove")).not.toBeInTheDocument();
    });
  });

  // file item inline diff toggle
  context("ファイルアイテムを2回クリックした場合", () => {
    // collapses the inline diff
    it("インライン差分が折りたたまれること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} />);
      fireEvent.click(container.querySelector(".bar")!);
      const fileHeader = container.querySelector(".fileHeader")!;
      fireEvent.click(fileHeader);
      expect(container.querySelector(".diffBody")).toBeInTheDocument();
      fireEvent.click(fileHeader);
      expect(container.querySelector(".diffBody")).not.toBeInTheDocument();
    });
  });

  // file item per-file stats
  context("ファイルアイテムの個別統計の場合", () => {
    // shows per-file additions
    it("ファイルごとの追加数を表示すること", () => {
      const diffs = [createFileDiff({ file: "a.ts", additions: 7, deletions: 2 })];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      fireEvent.click(container.querySelector(".bar")!);
      const fileStats = container.querySelector(".fileStats");
      expect(fileStats?.querySelector(".statAdd")?.textContent).toBe("+7");
    });

    // shows per-file deletions
    it("ファイルごとの削除数を表示すること", () => {
      const diffs = [createFileDiff({ file: "a.ts", additions: 7, deletions: 2 })];
      const { container } = render(<FileChangesHeader {...defaultProps} diffs={diffs} />);
      fireEvent.click(container.querySelector(".bar")!);
      const fileStats = container.querySelector(".fileStats");
      expect(fileStats?.querySelector(".statRemove")?.textContent).toBe("−2");
    });
  });

  // diff review button
  context("difitAvailable が true の場合", () => {
    // shows review button in header bar
    it("ヘッダーバーにレビューボタンを表示すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} difitAvailable={true} />);
      const bar = container.querySelector(".bar")!;
      expect(bar.querySelector(".reviewButton")).toBeTruthy();
    });

    // sends openDiffReview on header review button click
    it("ヘッダーのレビューボタンクリックで openDiffReview メッセージを送信すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} difitAvailable={true} />);
      const reviewBtn = container.querySelector(".reviewButton")!;
      fireEvent.click(reviewBtn);
      expect(postMessage).toHaveBeenCalledWith({ type: "openDiffReview" });
    });

    // shows per-file review button when expanded
    it("展開時にファイルごとのレビューボタンを表示すること", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} difitAvailable={true} />);
      fireEvent.click(container.querySelector(".bar")!);
      // openButton は ExternalLink（diff editor）と ExternalLink（diff review）の 2 つ
      const buttons = container.querySelectorAll(".openButton");
      expect(buttons.length).toBe(2);
    });

    // sends openDiffReview with focusFile on per-file button click
    it("ファイルごとのボタンクリックで focusFile 付きメッセージを送信すること", () => {
      const diff = createFileDiff({ file: "src/app.ts" });
      const { container } = render(
        <FileChangesHeader diffs={[diff]} onOpenDiffEditor={vi.fn()} difitAvailable={true} />,
      );
      fireEvent.click(container.querySelector(".bar")!);
      // 2 番目の openButton が diff review ボタン
      const buttons = container.querySelectorAll(".openButton");
      fireEvent.click(buttons[1]);
      expect(postMessage).toHaveBeenCalledWith({ type: "openDiffReview", focusFile: "src/app.ts" });
    });
  });

  context("difitAvailable が false の場合", () => {
    // does not show review button in header bar
    it("ヘッダーバーにレビューボタンが表示されないこと", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} difitAvailable={false} />);
      const bar = container.querySelector(".bar")!;
      expect(bar.querySelector(".reviewButton")).toBeFalsy();
    });

    // does not show per-file review button
    it("展開時にファイルごとのレビューボタンが表示されないこと", () => {
      const { container } = render(<FileChangesHeader {...defaultProps} difitAvailable={false} />);
      fireEvent.click(container.querySelector(".bar")!);
      // openButton は ExternalLink のみ
      const buttons = container.querySelectorAll(".openButton");
      expect(buttons.length).toBe(1);
    });
  });
});
