import { useCallback, useState } from "react";
import { useLocale } from "../../../locales";
import { ChevronRightIcon, FileIcon, SummaryIcon } from "../../atoms/icons";
import styles from "./SummaryHeader.module.css";

export type SummaryEntry = {
  title: string;
  body?: string;
  files: number;
  additions: number;
  deletions: number;
};

type Props = {
  summaries: SummaryEntry[];
};

export function SummaryHeader({ summaries }: Props) {
  const t = useLocale();
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((s) => !s), []);

  return (
    <div className={styles.root}>
      <button type="button" className={styles.bar} onClick={toggle} title={t["summary.toggle"]}>
        <SummaryIcon className={styles.icon} />
        <span className={styles.label}>{t["summary.label"]}</span>
        <span className={styles.count}>{summaries.length}</span>
        <span className={`${styles.chevron} ${expanded ? styles.expanded : ""}`}>
          <ChevronRightIcon />
        </span>
      </button>
      {expanded && (
        <div className={styles.list}>
          {summaries.map((entry) => {
            const hasStats = entry.files > 0 || entry.additions > 0 || entry.deletions > 0;
            return (
              <div key={entry.title} className={styles.item}>
                <div className={styles.itemTitle}>{entry.title}</div>
                {entry.body && <div className={styles.itemBody}>{entry.body}</div>}
                {hasStats && (
                  <div className={styles.itemStats}>
                    <span className={styles.itemFiles}>
                      <FileIcon width={10} height={10} />
                      {entry.files}
                    </span>
                    <span className={styles.statAdd}>+{entry.additions}</span>
                    <span className={styles.statRemove}>−{entry.deletions}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
