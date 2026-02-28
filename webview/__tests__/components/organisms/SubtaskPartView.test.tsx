import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubtaskPartView, isTaskToolPart } from "../../../components/organisms/SubtaskPartView";
import { createSession, createSubtaskPart, createTaskToolPart } from "../../factories";

const defaultProps = {
  part: createSubtaskPart("coder", "Implement feature X"),
  childSessions: [] as ReturnType<typeof createSession>[],
  onNavigateToChild: vi.fn(),
};

describe("SubtaskPartView", () => {
  // when rendered with a subtask part
  context("subtask パートを描画した場合", () => {
    // renders the header
    it("ヘッダーをレンダリングすること", () => {
      const { container } = render(<SubtaskPartView {...defaultProps} />);
      expect(container.querySelector(".header")).toBeInTheDocument();
    });

    // renders the agent icon
    it("エージェントアイコンをレンダリングすること", () => {
      const { container } = render(<SubtaskPartView {...defaultProps} />);
      expect(container.querySelector(".icon")).toBeInTheDocument();
    });

    // renders the action label "Agent"
    it("Agent ラベルをレンダリングすること", () => {
      const { container } = render(<SubtaskPartView {...defaultProps} />);
      expect(container.querySelector(".action")?.textContent).toBe("Agent");
    });

    // renders agent name and description in title
    it("エージェント名と説明をタイトルに表示すること", () => {
      const { container } = render(<SubtaskPartView {...defaultProps} />);
      expect(container.querySelector(".title")?.textContent).toBe("coder: Implement feature X");
    });
  });

  // when a matching child session exists
  context("対応する子セッションがある場合", () => {
    const childSession = createSession({ id: "child-1", title: "Implement feature X" });
    const propsWithChild = {
      ...defaultProps,
      childSessions: [childSession],
      onNavigateToChild: vi.fn(),
    };

    // renders the chevron navigate icon
    it("ナビゲーションシェブロンアイコンを表示すること", () => {
      const { container } = render(<SubtaskPartView {...propsWithChild} />);
      expect(container.querySelector(".navigate")).toBeInTheDocument();
    });

    // calls onNavigateToChild with child session id on click
    it("クリックで子セッションIDを渡して onNavigateToChild を呼ぶこと", async () => {
      const user = userEvent.setup();
      const { container } = render(<SubtaskPartView {...propsWithChild} />);
      await user.click(container.querySelector(".header")!);
      expect(propsWithChild.onNavigateToChild).toHaveBeenCalledWith("child-1");
    });
  });

  // when no matching child session exists
  context("対応する子セッションがない場合", () => {
    // does not render the chevron navigate icon
    it("ナビゲーションシェブロンアイコンを表示しないこと", () => {
      const { container } = render(<SubtaskPartView {...defaultProps} />);
      expect(container.querySelector(".navigate")).not.toBeInTheDocument();
    });

    // does not call onNavigateToChild on click
    it("クリックしても onNavigateToChild を呼ばないこと", async () => {
      const user = userEvent.setup();
      const onNav = vi.fn();
      const { container } = render(<SubtaskPartView {...defaultProps} onNavigateToChild={onNav} />);
      await user.click(container.querySelector(".header")!);
      expect(onNav).not.toHaveBeenCalled();
    });
  });

  // when child session matches by prompt instead of description
  context("prompt で子セッションが一致する場合", () => {
    const part = createSubtaskPart("coder", "desc-no-match", { prompt: "Find the bug" });
    const childSession = createSession({ id: "child-2", title: "Find the bug" });

    // renders the chevron navigate icon
    it("ナビゲーションシェブロンアイコンを表示すること", () => {
      const { container } = render(
        <SubtaskPartView part={part} childSessions={[childSession]} onNavigateToChild={vi.fn()} />,
      );
      expect(container.querySelector(".navigate")).toBeInTheDocument();
    });
  });

  // task tool part rendering
  context("task ツール呼び出し（type: tool, tool: task）を描画した場合", () => {
    const taskPart = createTaskToolPart("general", "Search for relevant files");
    const taskProps = {
      part: taskPart,
      childSessions: [] as ReturnType<typeof createSession>[],
      onNavigateToChild: vi.fn(),
    };

    // renders the Agent label
    it("Agent ラベルをレンダリングすること", () => {
      const { container } = render(<SubtaskPartView {...taskProps} />);
      expect(container.querySelector(".action")?.textContent).toBe("Agent");
    });

    // renders the agent name and description from input
    it("エージェント名と説明を state.input から表示すること", () => {
      const { container } = render(<SubtaskPartView {...taskProps} />);
      expect(container.querySelector(".title")?.textContent).toBe("general: Search for relevant files");
    });

    // navigates to matching child session
    it("対応する子セッションにナビゲートできること", async () => {
      const user = userEvent.setup();
      const childSession = createSession({ id: "child-task", title: "Search for relevant files" });
      const onNav = vi.fn();
      const { container } = render(
        <SubtaskPartView part={taskPart} childSessions={[childSession]} onNavigateToChild={onNav} />,
      );
      await user.click(container.querySelector(".header")!);
      expect(onNav).toHaveBeenCalledWith("child-task");
    });
  });

  // task tool part with running status
  context("task ツールが実行中の場合", () => {
    const runningTaskPart = createTaskToolPart("explore", "Analyze codebase", {
      state: {
        status: "running",
        title: "Analyze codebase",
        input: { subagent_type: "explore", description: "Analyze codebase" },
        time: { start: Date.now() },
      },
    });

    // shows spinner instead of agent icon
    it("エージェントアイコンの代わりにスピナーを表示すること", () => {
      const { container } = render(
        <SubtaskPartView part={runningTaskPart} childSessions={[]} onNavigateToChild={vi.fn()} />,
      );
      expect(container.querySelector(".spinner")).toBeInTheDocument();
    });
  });

  // task tool part with error status
  context("task ツールがエラーの場合", () => {
    const errorTaskPart = createTaskToolPart("general", "Failed task", {
      state: {
        status: "error",
        input: { subagent_type: "general", description: "Failed task" },
        error: "Something went wrong",
        time: { start: Date.now(), end: Date.now() },
      },
    });

    // shows error styling on action label
    it("アクションラベルにエラースタイルを適用すること", () => {
      const { container } = render(
        <SubtaskPartView part={errorTaskPart} childSessions={[]} onNavigateToChild={vi.fn()} />,
      );
      expect(container.querySelector(".actionError")).toBeInTheDocument();
    });

    // shows error message
    it("エラーメッセージを表示すること", () => {
      const { container } = render(
        <SubtaskPartView part={errorTaskPart} childSessions={[]} onNavigateToChild={vi.fn()} />,
      );
      expect(container.querySelector(".errorText")?.textContent).toBe("Something went wrong");
    });
  });
});

describe("isTaskToolPart", () => {
  // identifies task tool parts
  it("task ツールパートを識別すること", () => {
    expect(isTaskToolPart({ type: "tool", tool: "task" })).toBe(true);
  });

  // rejects non-task tool parts
  it("task 以外のツールパートを拒否すること", () => {
    expect(isTaskToolPart({ type: "tool", tool: "read" })).toBe(false);
  });

  // rejects non-tool parts
  it("type が tool でないパートを拒否すること", () => {
    expect(isTaskToolPart({ type: "subtask" })).toBe(false);
  });
});
