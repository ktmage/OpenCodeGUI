import { useMemo } from "react";
import { computeLineDiff } from "../../utils/diff";

type Props = {
  oldStr: string;
  newStr: string;
};

export function DiffView({ oldStr, newStr }: Props) {
  const lines = useMemo(() => computeLineDiff(oldStr, newStr), [oldStr, newStr]);
  const addCount = lines.filter((l) => l.type === "add").length;
  const removeCount = lines.filter((l) => l.type === "remove").length;

  return (
    <div className="tool-diff">
      <div className="tool-diff-stats">
        {addCount > 0 && <span className="tool-diff-stat-add">+{addCount}</span>}
        {removeCount > 0 && <span className="tool-diff-stat-remove">−{removeCount}</span>}
      </div>
      <div className="tool-diff-lines">
        {lines.map((line, i) => (
          <div key={i} className={`tool-diff-line tool-diff-line-${line.type}`}>
            <span className="tool-diff-line-marker">
              {line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}
            </span>
            <span className="tool-diff-line-text">{line.text || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
