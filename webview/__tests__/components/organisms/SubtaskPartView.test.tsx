import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SubtaskPartView } from "../../../components/organisms/SubtaskPartView";
import { createSession, createSubtaskPart } from "../../factories";

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
});
