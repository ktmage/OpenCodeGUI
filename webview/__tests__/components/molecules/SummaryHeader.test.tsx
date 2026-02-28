import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SummaryHeader } from "../../../components/molecules/SummaryHeader";
import type { SummaryEntry } from "../../../components/molecules/SummaryHeader/SummaryHeader";

const sampleSummaries: SummaryEntry[] = [
  { title: "Initial setup", body: "Created project structure", files: 3, additions: 120, deletions: 0 },
  { title: "Add authentication", body: "Implemented OAuth2 flow", files: 5, additions: 200, deletions: 30 },
  { title: "Fix typo", files: 1, additions: 1, deletions: 1 },
];

describe("SummaryHeader", () => {
  // when rendered with summaries
  context("要約データでレンダリングした場合", () => {
    // renders the header bar
    it("ヘッダーバーをレンダリングすること", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      expect(container.querySelector(".bar")).toBeInTheDocument();
    });

    // shows summary count
    it("要約の件数を表示すること", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      expect(container.querySelector(".count")?.textContent).toBe("3");
    });

    // does not show the list until expanded
    it("展開前にリストを表示しないこと", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      expect(container.querySelector(".list")).not.toBeInTheDocument();
    });
  });

  // when header bar is clicked
  context("ヘッダーバーをクリックした場合", () => {
    // expands the summary list
    it("要約リストを展開すること", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelector(".list")).toBeInTheDocument();
    });

    // shows all summary items
    it("全ての要約アイテムを表示すること", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelectorAll(".item")).toHaveLength(3);
    });

    // shows summary title
    it("要約のタイトルを表示すること", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      fireEvent.click(container.querySelector(".bar")!);
      const titles = container.querySelectorAll(".itemTitle");
      expect(titles[0]?.textContent).toBe("Initial setup");
      expect(titles[1]?.textContent).toBe("Add authentication");
    });

    // shows summary body when present
    it("要約の本文を表示すること", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      fireEvent.click(container.querySelector(".bar")!);
      const bodies = container.querySelectorAll(".itemBody");
      expect(bodies[0]?.textContent).toBe("Created project structure");
    });

    // does not show body when absent
    it("本文がない要約では本文要素を表示しないこと", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      fireEvent.click(container.querySelector(".bar")!);
      // 3rd summary has no body
      const items = container.querySelectorAll(".item");
      expect(items[2]?.querySelector(".itemBody")).not.toBeInTheDocument();
    });
  });

  // when summary has file stats
  context("ファイル統計がある場合", () => {
    // shows file count, additions and deletions
    it("ファイル数・追加行数・削除行数を表示すること", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      fireEvent.click(container.querySelector(".bar")!);
      const stats = container.querySelectorAll(".itemStats");
      expect(stats).toHaveLength(3);
      expect(stats[0]?.querySelector(".itemFiles")?.textContent).toContain("3");
      expect(stats[0]?.querySelector(".statAdd")?.textContent).toBe("+120");
      expect(stats[0]?.querySelector(".statRemove")?.textContent).toBe("−0");
    });
  });

  // when summary has no file stats
  context("ファイル統計が全て0の場合", () => {
    // does not show stats section
    it("統計セクションを表示しないこと", () => {
      const noStats: SummaryEntry[] = [{ title: "Discussion", files: 0, additions: 0, deletions: 0 }];
      const { container } = render(<SummaryHeader summaries={noStats} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelector(".itemStats")).not.toBeInTheDocument();
    });
  });

  // when header is clicked twice
  context("ヘッダーを2回クリックした場合", () => {
    // collapses the summary list
    it("要約リストを折りたたむこと", () => {
      const { container } = render(<SummaryHeader summaries={sampleSummaries} />);
      const bar = container.querySelector(".bar")!;
      fireEvent.click(bar);
      expect(container.querySelector(".list")).toBeInTheDocument();
      fireEvent.click(bar);
      expect(container.querySelector(".list")).not.toBeInTheDocument();
    });
  });
});
