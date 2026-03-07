import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { findMatchingChild, isTaskToolPart, SubtaskPartView } from "../../../components/organisms/SubtaskPartView";
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

describe("findMatchingChild", () => {
  // returns undefined when childSessions is empty
  context("子セッションが空の場合", () => {
    it("undefined を返すこと", () => {
      const part = createTaskToolPart("general", "Do something");
      expect(findMatchingChild(part, [], "Do something", "Do something")).toBeUndefined();
    });
  });

  // matches by metadata.sessionId (Strategy 1)
  context("state.metadata.sessionId で直接マッチする場合", () => {
    it("metadata の sessionId で子セッションを特定すること", () => {
      const childSession = createSession({ id: "child-meta-1", title: "Unrelated title" });
      const part = createTaskToolPart("general", "Some task", {
        state: {
          status: "completed",
          title: "Some task",
          input: { subagent_type: "general", description: "Some task", prompt: "Some task" },
          output: "Done",
          metadata: { sessionId: "child-meta-1" },
          time: { start: Date.now() - 1000, end: Date.now() },
        },
      });
      expect(findMatchingChild(part, [childSession], "Some task", "Some task")).toBe(childSession);
    });

    it("metadata.sessionId が childSessions にない場合はフォールバックすること", () => {
      const childSession = createSession({ id: "child-2", title: "Some task" });
      const part = createTaskToolPart("general", "Some task", {
        state: {
          status: "completed",
          title: "Some task",
          input: { subagent_type: "general", description: "Some task", prompt: "Some task" },
          output: "Done",
          metadata: { sessionId: "non-existent-id" },
          time: { start: Date.now() - 1000, end: Date.now() },
        },
      });
      // Falls back to Strategy 2 (title includes description)
      expect(findMatchingChild(part, [childSession], "Some task", "Some task")).toBe(childSession);
    });
  });

  // matches by partial title containing description (Strategy 2 — server appends suffix)
  context("子セッション title にサーバー付与のサフィックスがある場合", () => {
    it("description が title に含まれる場合マッチすること", () => {
      // Server sets title as: "Fix the bug (@coder subagent)"
      const childSession = createSession({ id: "child-3", title: "Fix the bug (@coder subagent)" });
      const part = createSubtaskPart("coder", "Fix the bug");
      expect(findMatchingChild(part, [childSession], "Fix the bug", "Fix the bug")).toBe(childSession);
    });
  });

  // matches by prompt when description doesn't match (Strategy 3)
  context("description ではマッチせず prompt でマッチする場合", () => {
    it("prompt が title に含まれる場合マッチすること", () => {
      const childSession = createSession({ id: "child-4", title: "Find critical bugs (@general subagent)" });
      const part = createSubtaskPart("general", "unrelated-desc", { prompt: "Find critical bugs" });
      expect(findMatchingChild(part, [childSession], "unrelated-desc", "Find critical bugs")).toBe(childSession);
    });
  });

  // returns undefined when no strategy matches
  context("どの戦略でもマッチしない場合", () => {
    it("undefined を返すこと", () => {
      const childSession = createSession({ id: "child-5", title: "Completely different task" });
      const part = createSubtaskPart("coder", "Some description", { prompt: "Some prompt" });
      expect(findMatchingChild(part, [childSession], "Some description", "Some prompt")).toBeUndefined();
    });
  });

  // skips metadata check for pending status
  context("task ツールが pending 状態の場合", () => {
    it("metadata チェックをスキップして title マッチにフォールバックすること", () => {
      const childSession = createSession({ id: "child-6", title: "Pending task (@agent subagent)" });
      const part = createTaskToolPart("agent", "Pending task", {
        state: {
          status: "pending",
          input: {},
          raw: "",
        },
      });
      expect(findMatchingChild(part, [childSession], "Pending task", "")).toBe(childSession);
    });
  });

  // metadata takes priority over title match
  context("metadata と title の両方でマッチ可能な場合", () => {
    it("metadata.sessionId のマッチを優先すること", () => {
      const childByTitle = createSession({ id: "child-title", title: "Do X" });
      const childByMeta = createSession({ id: "child-meta", title: "Different" });
      const part = createTaskToolPart("general", "Do X", {
        state: {
          status: "completed",
          title: "Do X",
          input: { subagent_type: "general", description: "Do X", prompt: "Do X" },
          output: "Done",
          metadata: { sessionId: "child-meta" },
          time: { start: Date.now() - 1000, end: Date.now() },
        },
      });
      expect(findMatchingChild(part, [childByTitle, childByMeta], "Do X", "Do X")).toBe(childByMeta);
    });
  });
});

// Component: navigate with server-format title (suffix appended)
describe("SubtaskPartView — サーバー形式のタイトルマッチング", () => {
  context("子セッションの title にサフィックスが付与されている場合", () => {
    it("description を含む title にマッチしてナビゲートできること", async () => {
      const user = userEvent.setup();
      const childSession = createSession({ id: "child-suffix", title: "Analyze code (@coder subagent)" });
      const part = createTaskToolPart("coder", "Analyze code");
      const onNav = vi.fn();
      const { container } = render(
        <SubtaskPartView part={part} childSessions={[childSession]} onNavigateToChild={onNav} />,
      );
      expect(container.querySelector(".navigate")).toBeInTheDocument();
      await user.click(container.querySelector(".header")!);
      expect(onNav).toHaveBeenCalledWith("child-suffix");
    });
  });

  context("metadata.sessionId で子セッションに直接ナビゲートする場合", () => {
    it("metadata の sessionId を使って正しい子セッションにナビゲートすること", async () => {
      const user = userEvent.setup();
      const childSession = createSession({ id: "child-from-meta", title: "Server assigned title" });
      const part = createTaskToolPart("general", "My task", {
        state: {
          status: "completed",
          title: "My task",
          input: { subagent_type: "general", description: "My task", prompt: "details here" },
          output: "ok",
          metadata: { sessionId: "child-from-meta" },
          time: { start: Date.now() - 1000, end: Date.now() },
        },
      });
      const onNav = vi.fn();
      const { container } = render(
        <SubtaskPartView part={part} childSessions={[childSession]} onNavigateToChild={onNav} />,
      );
      expect(container.querySelector(".navigate")).toBeInTheDocument();
      await user.click(container.querySelector(".header")!);
      expect(onNav).toHaveBeenCalledWith("child-from-meta");
    });
  });
});
