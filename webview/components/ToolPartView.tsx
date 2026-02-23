import { useState } from "react";
import type { ToolPart } from "@opencode-ai/sdk";

type Props = {
  part: ToolPart;
};

/**
 * SDK のセマンティクスに忠実にラベルを決定する。
 * - completed: state.title（SDK が必ず提供する）
 * - running: state.title があればそれを、なければツール識別子
 * - pending / error: ツール識別子
 */
function getLabel(part: ToolPart): string {
  const { state, tool } = part;
  if (state.status === "completed") return state.title;
  if (state.status === "running" && state.title) return state.title;
  return tool;
}

export function ToolPartView({ part }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { state } = part;

  const isActive = state.status === "running" || state.status === "pending";
  const isCompleted = state.status === "completed";
  const isError = state.status === "error";
  const label = getLabel(part);

  return (
    <div className={`tool-part ${state.status}`}>
      <div className="tool-part-header" onClick={() => setExpanded((s) => !s)}>
        <span className="tool-part-icon">
          {isActive && (
            <svg className="tool-part-spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          {isCompleted && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6.27 10.87h.01l4.49-4.49-.71-.71-3.78 3.78L4.49 7.67l-.71.71 2.49 2.49z" />
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
            </svg>
          )}
          {isError && (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
              <path d="M7.25 4h1.5v5h-1.5V4zm0 6h1.5v1.5h-1.5V10z" />
            </svg>
          )}
        </span>
        <span className="tool-part-label">{label}</span>
        <span className={`tool-part-chevron ${expanded ? "expanded" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5.3 5.3-5.3 5.4z" />
          </svg>
        </span>
      </div>
      {expanded && (
        <div className="tool-part-body">
          {isCompleted && state.output && (
            <pre className="tool-part-output">{state.output}</pre>
          )}
          {isError && (
            <pre className="tool-part-output tool-part-error">{state.error}</pre>
          )}
          {isActive && state.input && (
            <pre className="tool-part-output">{JSON.stringify(state.input, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
