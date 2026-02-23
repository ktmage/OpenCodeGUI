import { useState } from "react";
import type { ToolPart } from "@opencode-ai/sdk";

type Props = {
  part: ToolPart;
};

export function ToolPartView({ part }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { state } = part;

  const statusLabel =
    state.status === "pending"
      ? "Pending"
      : state.status === "running"
        ? "Running..."
        : state.status === "completed"
          ? "Done"
          : "Error";

  return (
    <div className="tool-call">
      <div className="tool-call-header" onClick={() => setExpanded((s) => !s)}>
        <span className="tool-call-name">{part.tool}</span>
        <span className={`tool-call-status ${state.status}`}>
          {state.status === "running" && "title" in state && state.title
            ? state.title
            : statusLabel}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>
      {expanded && (
        <div className="tool-call-body">
          {state.status === "completed" && state.output}
          {state.status === "error" && state.error}
          {(state.status === "pending" || state.status === "running") &&
            JSON.stringify(state.input, null, 2)}
        </div>
      )}
    </div>
  );
}
