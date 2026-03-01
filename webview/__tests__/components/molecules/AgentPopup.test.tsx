import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentPopup } from "../../../components/molecules/AgentPopup";

function createAgent(name: string, description?: string) {
  return {
    name,
    description,
    mode: "subagent" as const,
    builtIn: true,
    permission: { edit: "ask" as const, bash: {} },
    tools: {},
    options: {},
  };
}

describe("AgentPopup", () => {
  // when rendered with agents
  context("エージェント一覧がある場合", () => {
    const agents = [createAgent("coder", "Coding agent"), createAgent("researcher", "Research agent")];

    // renders agent names
    it("エージェント名を表示すること", () => {
      const { container } = render(
        <AgentPopup agents={agents} onSelectAgent={vi.fn()} agentPopupRef={{ current: null }} focusedIndex={-1} />,
      );
      const titles = container.querySelectorAll(".title");
      expect(titles[0]?.textContent).toBe("coder");
      expect(titles[1]?.textContent).toBe("researcher");
    });

    // renders agent descriptions
    it("エージェントの説明を表示すること", () => {
      const { container } = render(
        <AgentPopup agents={agents} onSelectAgent={vi.fn()} agentPopupRef={{ current: null }} focusedIndex={-1} />,
      );
      const descriptions = container.querySelectorAll(".description");
      expect(descriptions[0]?.textContent).toBe("Coding agent");
    });

    // calls onSelectAgent when clicked
    it("クリックで onSelectAgent を呼ぶこと", async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <AgentPopup agents={agents} onSelectAgent={onSelect} agentPopupRef={{ current: null }} focusedIndex={-1} />,
      );
      const items = container.querySelectorAll(".root > div");
      await user.click(items[0]!);
      expect(onSelect).toHaveBeenCalledWith(agents[0]);
    });
  });

  // when focusedIndex highlights a specific agent
  context("focusedIndex が指定された場合", () => {
    const agents = [createAgent("coder", "Coding agent"), createAgent("researcher", "Research agent")];

    // applies data-focused to the correct item
    it("対応するアイテムに data-focused 属性が付与されること", () => {
      const { container } = render(
        <AgentPopup agents={agents} onSelectAgent={vi.fn()} agentPopupRef={{ current: null }} focusedIndex={0} />,
      );
      const items = container.querySelectorAll(".root > div");
      expect(items[0]?.getAttribute("data-focused")).toBe("true");
      expect(items[1]?.hasAttribute("data-focused")).toBe(false);
    });
  });
});
