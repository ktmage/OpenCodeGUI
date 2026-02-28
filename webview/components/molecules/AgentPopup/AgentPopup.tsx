import type { Agent } from "@opencode-ai/sdk";
import { useLocale } from "../../../locales";
import { ListItem } from "../../atoms/ListItem";
import styles from "./AgentPopup.module.css";

type Props = {
  agents: Agent[];
  onSelectAgent: (agent: Agent) => void;
  agentPopupRef: React.RefObject<HTMLDivElement | null>;
};

export function AgentPopup({ agents, onSelectAgent, agentPopupRef }: Props) {
  const t = useLocale();

  return (
    <div className={styles.root} ref={agentPopupRef} data-testid="agent-popup">
      {agents.length > 0 ? (
        agents.map((agent) => (
          <ListItem
            key={agent.name}
            title={agent.name}
            description={agent.description}
            onClick={() => onSelectAgent(agent)}
          />
        ))
      ) : (
        <div className={styles.empty}>{t["input.noAgents"]}</div>
      )}
    </div>
  );
}
