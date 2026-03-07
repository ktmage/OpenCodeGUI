import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToolPartView } from "../../../components/organisms/ToolPartView";
import { AppContextProvider, type AppContextValue } from "../../../contexts/AppContext";
import { createToolPart } from "../../factories";

const mockOnOpenFile = vi.fn();

function createContextWrapper(overrides: Partial<AppContextValue> = {}) {
  const contextValue = {
    onOpenFile: mockOnOpenFile,
    ...overrides,
  } as unknown as AppContextValue;
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppContextProvider value={contextValue}>{children}</AppContextProvider>;
  };
}

describe("ToolPartView", () => {
  const wrapper = createContextWrapper();

  // when rendered with a completed tool part
  context("completed 状態のツールパートの場合", () => {
    // renders the tool part header
    it("ツールパートヘッダーをレンダリングすること", () => {
      const part = createToolPart("file_read");
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      expect(container.querySelector(".header")).toBeInTheDocument();
    });

    // renders the action icon
    it("アクションアイコンをレンダリングすること", () => {
      const part = createToolPart("file_read");
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      expect(container.querySelector(".icon")).toBeInTheDocument();
    });

    // renders the action label
    it("アクションラベルをレンダリングすること", () => {
      const part = createToolPart("file_read");
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      expect(container.querySelector(".action")).toBeInTheDocument();
    });
  });

  // when header is clicked
  context("ヘッダーをクリックした場合", () => {
    // shows the body
    it("ボディを表示すること", () => {
      const part = createToolPart("file_read", {
        state: { status: "completed", title: "test", input: {}, output: "result" },
      } as any);
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      fireEvent.click(container.querySelector(".header")!);
      expect(container.querySelector(".body")).toBeInTheDocument();
    });
  });

  // when tool is in running state
  context("running 状態の場合", () => {
    // renders the spinner icon
    it("スピナーアイコンをレンダリングすること", () => {
      const part = createToolPart("bash", {
        state: { status: "running", title: "running...", input: {} },
      } as any);
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      expect(container.querySelector(".spinner")).toBeInTheDocument();
    });
  });

  // when tool is in error state
  context("error 状態の場合", () => {
    // renders error icon
    it("エラーアイコンをレンダリングすること", () => {
      const part = createToolPart("bash", {
        state: { status: "error", title: "failed", input: {}, error: "something went wrong" },
      } as any);
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      expect(container.querySelector(".icon svg")).toBeInTheDocument();
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
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      fireEvent.click(container.querySelector(".header")!);
      expect(container.querySelector("[data-testid='diff-view']")).toBeInTheDocument();
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
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      fireEvent.click(container.querySelector(".header")!);
      expect(container.querySelector("[data-testid='diff-view']")).toBeInTheDocument();
    });
  });

  // file path link in title
  context("タイトルに絶対ファイルパスがある場合", () => {
    // renders file path as a clickable link
    it("ファイルパスがクリック可能なリンクとしてレンダリングされること", () => {
      const part = createToolPart("file_read", {
        state: {
          status: "completed",
          title: "/home/user/project/src/main.ts",
          input: { filePath: "/home/user/project/src/main.ts" },
          output: "ok",
        },
      } as any);
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      expect(container.querySelector(".fileChip")).toBeInTheDocument();
    });

    // calls onOpenFile when file path link is clicked
    it("リンクをクリックすると onOpenFile が呼ばれること", () => {
      mockOnOpenFile.mockClear();
      const part = createToolPart("file_read", {
        state: {
          status: "completed",
          title: "/home/user/project/src/main.ts",
          input: { filePath: "/home/user/project/src/main.ts" },
          output: "ok",
        },
      } as any);
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      fireEvent.click(container.querySelector(".fileChip")!);
      expect(mockOnOpenFile).toHaveBeenCalledWith("/home/user/project/src/main.ts");
    });
  });

  // title without absolute path
  context("タイトルが絶対パスでない場合", () => {
    // does not render as a link
    it("リンクとしてレンダリングされないこと", () => {
      const part = createToolPart("bash", {
        state: {
          status: "completed",
          title: "running command...",
          input: { command: "ls" },
          output: "ok",
        },
      } as any);
      const { container } = render(<ToolPartView part={part} />, { wrapper });
      expect(container.querySelector(".fileChip")).not.toBeInTheDocument();
    });
  });
});
