import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShellResultView } from "../../../components/molecules/ShellResultView";
import { createToolPart } from "../../factories";

describe("ShellResultView", () => {
  // --- Completed command ---
  context("完了したコマンドを表示する場合", () => {
    // renders Shell header
    it("Shell ヘッダーを表示すること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "completed", title: "ls", input: { command: "ls" }, output: "file.txt" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      expect(screen.getByText("Shell")).toBeInTheDocument();
    });

    // renders $ prompt with command
    it("$ プロンプトとコマンドを表示すること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "completed", title: "ls -la", input: { command: "ls -la" }, output: "total 0" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      expect(screen.getByText("$")).toBeInTheDocument();
      expect(screen.getByText("ls -la")).toBeInTheDocument();
    });

    // renders output text
    it("出力テキストを表示すること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "completed", title: "echo", input: { command: "echo hello" }, output: "hello" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      expect(screen.getByText("hello")).toBeInTheDocument();
    });

    // is expanded by default
    it("デフォルトで展開状態であること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "completed", title: "ls", input: { command: "ls" }, output: "file.txt" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      expect(screen.getByText("file.txt")).toBeInTheDocument();
    });
  });

  // --- Collapse/expand toggle ---
  context("ヘッダーをクリックした場合", () => {
    // hides output when collapsed
    it("出力が非表示になること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "completed", title: "ls", input: { command: "ls" }, output: "file.txt" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      fireEvent.click(screen.getByText("Shell"));
      expect(screen.queryByText("file.txt")).not.toBeInTheDocument();
    });

    // shows output when expanded again
    it("再度クリックで出力が表示されること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "completed", title: "ls", input: { command: "ls" }, output: "file.txt" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      fireEvent.click(screen.getByText("Shell"));
      fireEvent.click(screen.getByText("Shell"));
      expect(screen.getByText("file.txt")).toBeInTheDocument();
    });
  });

  // --- Running command ---
  context("実行中のコマンドを表示する場合", () => {
    // renders spinner
    it("スピナーを表示すること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "running", title: "sleep", input: { command: "sleep 10" } },
        } as any),
      ];
      const { container } = render(<ShellResultView parts={parts} />);
      expect(container.querySelector("[class*='spinner']")).toBeInTheDocument();
    });

    // does not render output
    it("出力を表示しないこと", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "running", title: "sleep", input: { command: "sleep 10" } },
        } as any),
      ];
      const { container } = render(<ShellResultView parts={parts} />);
      expect(container.querySelector("[class*='output']")).not.toBeInTheDocument();
    });
  });

  // --- Pending command ---
  context("pending 状態のコマンドを表示する場合", () => {
    // renders spinner for pending status
    it("スピナーを表示すること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "pending" },
        } as any),
      ];
      const { container } = render(<ShellResultView parts={parts} />);
      expect(container.querySelector("[class*='spinner']")).toBeInTheDocument();
    });
  });

  // --- Error command ---
  context("エラーのコマンドを表示する場合", () => {
    // renders error output
    it("エラー出力を表示すること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "error", title: "bad", input: { command: "bad-cmd" }, error: "command not found" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      expect(screen.getByText("command not found")).toBeInTheDocument();
    });

    // applies error styling
    it("エラー用のスタイルが適用されること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "error", title: "bad", input: { command: "bad-cmd" }, error: "command not found" },
        } as any),
      ];
      const { container } = render(<ShellResultView parts={parts} />);
      expect(container.querySelector("[class*='outputError']")).toBeInTheDocument();
    });
  });

  // --- Multiple entries ---
  context("複数のコマンド結果がある場合", () => {
    // renders all entries
    it("すべてのコマンドエントリを表示すること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "completed", title: "ls", input: { command: "ls" }, output: "file1.txt" },
        } as any),
        createToolPart("bash", {
          state: { status: "completed", title: "pwd", input: { command: "pwd" }, output: "/home" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      expect(screen.getByText("file1.txt")).toBeInTheDocument();
      expect(screen.getByText("/home")).toBeInTheDocument();
    });

    // renders multiple $ prompts
    it("複数の $ プロンプトを表示すること", () => {
      const parts = [
        createToolPart("bash", {
          state: { status: "completed", title: "ls", input: { command: "ls" }, output: "file1.txt" },
        } as any),
        createToolPart("bash", {
          state: { status: "completed", title: "pwd", input: { command: "pwd" }, output: "/home" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      expect(screen.getAllByText("$")).toHaveLength(2);
    });
  });

  // --- Empty parts ---
  context("パーツが空の場合", () => {
    // renders header without error
    it("ヘッダーのみ表示してエラーにならないこと", () => {
      render(<ShellResultView parts={[]} />);
      expect(screen.getByText("Shell")).toBeInTheDocument();
    });
  });

  // --- Non-tool parts are filtered ---
  context("tool 以外のパーツが含まれる場合", () => {
    // filters out non-tool parts
    it("tool 以外のパーツが除外されること", () => {
      const parts = [
        { id: "p1", type: "text", text: "ignored", messageID: "m1" } as any,
        createToolPart("bash", {
          state: { status: "completed", title: "ls", input: { command: "ls" }, output: "ok" },
        } as any),
      ];
      render(<ShellResultView parts={parts} />);
      expect(screen.getAllByText("$")).toHaveLength(1);
    });
  });
});
