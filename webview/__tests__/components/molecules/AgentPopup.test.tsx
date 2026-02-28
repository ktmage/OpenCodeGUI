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
        <AgentPopup agents={agents} onSelectAgent={vi.fn()} agentPopupRef={{ current: null }} />,
      );
      const titles = container.querySelectorAll(".title");
      expect(titles[0]?.textContent).toBe("coder");
      expect(titles[1]?.textContent).toBe("researcher");
    });

    // renders agent descriptions
    it("エージェントの説明を表示すること", () => {
      const { container } = render(
        <AgentPopup agents={agents} onSelectAgent={vi.fn()} agentPopupRef={{ current: null }} />,
      );
      const descriptions = container.querySelectorAll(".description");
      expect(descriptions[0]?.textContent).toBe("Coding agent");
    });

    // calls onSelectAgent when clicked
    it("クリックで onSelectAgent を呼ぶこと", async () => {
      const onSelect = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <AgentPopup agents={agents} onSelectAgent={onSelect} agentPopupRef={{ current: null }} />,
      );
      const items = container.querySelectorAll(".root > div");
      await user.click(items[0]!);
      expect(onSelect).toHaveBeenCalledWith(agents[0]);
    });
  });

  // when no agents available
  context("エージェントがない場合", () => {
    // shows empty message
    it("空メッセージを表示すること", () => {
      const { container } = render(
        <AgentPopup agents={[]} onSelectAgent={vi.fn()} agentPopupRef={{ current: null }} />,
      );
      expect(container.querySelector(".empty")?.textContent).toBe("No agents available");
    });
  });
});
