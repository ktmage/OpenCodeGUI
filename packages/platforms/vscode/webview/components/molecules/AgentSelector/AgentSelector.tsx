import type { AgentInfo } from "@opencodegui/core";
import { useMemo } from "react";
import { useLocale } from "../../../locales";
import { AgentIcon, ChevronRightIcon } from "../../atoms/icons";
import { Popover } from "../../atoms/Popover";
import styles from "./AgentSelector.module.css";

type Props = {
  agents: AgentInfo[];
  selectedAgent: string | null;
  onSelect: (agentName: string) => void;
};

export function AgentSelector({ agents, selectedAgent, onSelect }: Props) {
  const t = useLocale();

  // プライマリエージェントのみ表示（mode: "primary" | "all"）
  const primaryAgents = useMemo(() => agents.filter((a) => a.mode === "primary" || a.mode === "all"), [agents]);

  const selectedAgentInfo = useMemo(
    () => primaryAgents.find((a) => a.name === selectedAgent),
    [primaryAgents, selectedAgent],
  );

  const displayName = selectedAgentInfo?.name ?? selectedAgent ?? t["agent.selectAgent"];

  if (primaryAgents.length === 0) return null;

  return (
    <Popover
      className={styles.root}
      trigger={({ open, toggle }) => (
        <button type="button" className={styles.button} onClick={toggle} title={t["agent.selectAgent"]}>
          {selectedAgentInfo?.color && (
            <span className={styles.colorDot} style={{ backgroundColor: selectedAgentInfo.color }} />
          )}
          {!selectedAgentInfo?.color && <AgentIcon width={14} />}
          <span className={styles.label}>{displayName}</span>
          <span className={`${styles.chevron} ${open ? styles.expanded : ""}`}>
            <ChevronRightIcon />
          </span>
        </button>
      )}
      panel={({ close }) => (
        <div className={styles.panel}>
          <div className={styles.panelBody}>
            <div className={styles.sectionTitle}>{t["agent.agents"]}</div>
            {primaryAgents.map((agent) => {
              const isSelected = agent.name === selectedAgent;
              return (
                <div
                  key={agent.name}
                  className={`${styles.item} ${isSelected ? styles.active : ""}`}
                  onClick={() => {
                    onSelect(agent.name);
                    close();
                  }}
                >
                  <span className={styles.itemCheck}>{isSelected ? "✓" : ""}</span>
                  <span className={styles.itemName}>
                    {agent.color && <span className={styles.colorDot} style={{ backgroundColor: agent.color }} />}
                    {agent.name}
                  </span>
                  {agent.description && <span className={styles.itemDescription}>{agent.description}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    />
  );
}
