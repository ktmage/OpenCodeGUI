import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolPartView } from "../../../components/organisms/ToolPartView";
import { createToolPart } from "../../factories";

describe("ToolPartView", () => {
  // when rendered with a completed tool part
  context("completed 状態のツールパートの場合", () => {
    // renders the tool part header
    it("ツールパートヘッダーをレンダリングすること", () => {
      const part = createToolPart("file_read");
      const { container } = render(<ToolPartView part={part} />);
      expect(container.querySelector(".tool-part-header")).toBeInTheDocument();
    });

    // renders the action icon
    it("アクションアイコンをレンダリングすること", () => {
      const part = createToolPart("file_read");
      const { container } = render(<ToolPartView part={part} />);
      expect(container.querySelector(".tool-part-icon")).toBeInTheDocument();
    });

    // renders the action label
    it("アクションラベルをレンダリングすること", () => {
      const part = createToolPart("file_read");
      const { container } = render(<ToolPartView part={part} />);
      expect(container.querySelector(".tool-part-action")).toBeInTheDocument();
    });
  });

  // when header is clicked
  context("ヘッダーをクリックした場合", () => {
    // shows the body
    it("ボディを表示すること", () => {
      const part = createToolPart("file_read", {
        state: { status: "completed", title: "test", input: {}, output: "result" },
      } as any);
      const { container } = render(<ToolPartView part={part} />);
      fireEvent.click(container.querySelector(".tool-part-header")!);
      expect(container.querySelector(".tool-part-body")).toBeInTheDocument();
    });
  });

  // when tool is in running state
  context("running 状態の場合", () => {
    // renders the spinner icon
    it("スピナーアイコンをレンダリングすること", () => {
      const part = createToolPart("bash", {
        state: { status: "running", title: "running...", input: {} },
      } as any);
      const { container } = render(<ToolPartView part={part} />);
      expect(container.querySelector(".tool-part-spinner")).toBeInTheDocument();
    });
  });

  // when tool is in error state
  context("error 状態の場合", () => {
    // renders error icon
    it("エラーアイコンをレンダリングすること", () => {
      const part = createToolPart("bash", {
        state: { status: "error", title: "failed", input: {}, error: "something went wrong" },
      } as any);
      const { container } = render(<ToolPartView part={part} />);
      expect(container.querySelector(".tool-part-icon svg")).toBeInTheDocument();
    });
  });

  // when expanded and has file edit input
  context("展開中でファイル編集入力がある場合", () => {
    // renders DiffView
    it("DiffView をレンダリングすること", () => {
      const part = createToolPart("file_edit", {
        state: {
          status: "completed",
          title: "test.ts",
          input: { oldString: "old", newString: "new", filePath: "test.ts" },
          output: "ok",
        },
      } as any);
      const { container } = render(<ToolPartView part={part} />);
      fireEvent.click(container.querySelector(".tool-part-header")!);
      expect(container.querySelector(".tool-diff")).toBeInTheDocument();
    });
  });

  // when expanded and has file create input
  context("展開中でファイル作成入力がある場合", () => {
    // renders FileCreateView
    it("FileCreateView をレンダリングすること", () => {
      const part = createToolPart("file_write", {
        state: {
          status: "completed",
          title: "new.ts",
          input: { content: "new content", filePath: "new.ts" },
          output: "ok",
        },
      } as any);
      const { container } = render(<ToolPartView part={part} />);
      fireEvent.click(container.querySelector(".tool-part-header")!);
      expect(container.querySelector(".tool-diff")).toBeInTheDocument();
    });
  });
});
