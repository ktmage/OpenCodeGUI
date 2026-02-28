import { useMemo } from "react";
import { computeLineDiff } from "../../../utils/diff";
import styles from "./DiffView.module.css";

type LineType = "add" | "remove" | "keep";
const lineTypeClass: Record<LineType, string> = {
  add: styles.lineAdd,
  remove: styles.lineRemove,
  keep: styles.lineContext,
};

type Props = {
  oldStr: string;
  newStr: string;
};

export function DiffView({ oldStr, newStr }: Props) {
  const lines = useMemo(() => computeLineDiff(oldStr, newStr), [oldStr, newStr]);
  const addCount = lines.filter((l) => l.type === "add").length;
  const removeCount = lines.filter((l) => l.type === "remove").length;

  return (
    <div className={styles.root} data-testid="diff-view">
      <div className={styles.stats}>
        {addCount > 0 && <span className={styles.statAdd}>+{addCount}</span>}
        {removeCount > 0 && <span className={styles.statRemove}>−{removeCount}</span>}
      </div>
      <div className={styles.lines}>
        {lines.map((line, i) => (
          <div key={i} className={`${styles.line} ${lineTypeClass[line.type as LineType] ?? styles.lineContext}`}>
            <span className={styles.lineMarker}>
              {line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}
            </span>
            <span className={styles.lineText}>{line.text || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
