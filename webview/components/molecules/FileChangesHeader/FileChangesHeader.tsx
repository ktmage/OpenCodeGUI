import type { FileDiff } from "@opencode-ai/sdk";
import { useState } from "react";
import { useLocale } from "../../../locales";
import { IconButton } from "../../atoms/IconButton";
import { ChevronRightIcon, DiffIcon, ExternalLinkIcon } from "../../atoms/icons";
import { DiffView } from "../DiffView";
import styles from "./FileChangesHeader.module.css";

type Props = {
  diffs: FileDiff[];
  onOpenDiffEditor: (filePath: string, before: string, after: string) => void;
};

/** ファイルパスから basename を取得 */
function basename(filePath: string): string {
  const parts = filePath.split("/");
  return parts[parts.length - 1] || filePath;
}

/** ファイルパスからディレクトリ部分を取得 */
function dirname(filePath: string): string {
  const lastSlash = filePath.lastIndexOf("/");
  if (lastSlash < 0) return "";
  return filePath.slice(0, lastSlash);
}

/** ファイルの変更種別を判定 */
function getFileStatus(diff: FileDiff): "added" | "deleted" | "modified" {
  if (diff.before === "" && diff.after !== "") return "added";
  if (diff.before !== "" && diff.after === "") return "deleted";
  return "modified";
}

function FileChangeItem({
  diff,
  onOpenDiffEditor,
}: { diff: FileDiff; onOpenDiffEditor: (filePath: string, before: string, after: string) => void }) {
  const t = useLocale();
  const [expanded, setExpanded] = useState(false);
  const status = getFileStatus(diff);
  const fileName = basename(diff.file);
  const dirName = dirname(diff.file);

  const statusClass: Record<string, string> = {
    added: styles.statusAdded,
    deleted: styles.statusDeleted,
    modified: styles.statusModified,
  };

  const statusLabel: Record<string, string> = {
    added: "A",
    deleted: "D",
    modified: "M",
  };

  return (
    <div className={styles.fileItem}>
      <div className={styles.fileHeader} onClick={() => setExpanded((s) => !s)}>
        <span className={`${styles.fileChevron} ${expanded ? styles.fileChevronExpanded : ""}`}>
          <ChevronRightIcon />
        </span>
        <span className={`${styles.statusBadge} ${statusClass[status] ?? ""}`}>{statusLabel[status]}</span>
        <span className={styles.fileName} title={diff.file}>
          {fileName}
        </span>
        {dirName && <span className={styles.filePath}>{dirName}</span>}
        <span className={styles.fileStats}>
          {diff.additions > 0 && <span className={styles.statAdd}>+{diff.additions}</span>}
          {diff.deletions > 0 && <span className={styles.statRemove}>−{diff.deletions}</span>}
        </span>
        <IconButton
          className={styles.openButton}
          onClick={(e) => {
            e.stopPropagation();
            onOpenDiffEditor(diff.file, diff.before, diff.after);
          }}
          title={t["fileChanges.openDiff"]}
        >
          <ExternalLinkIcon />
        </IconButton>
      </div>
      {expanded && (
        <div className={styles.diffBody}>
          <DiffView oldStr={diff.before} newStr={diff.after} />
        </div>
      )}
    </div>
  );
}

export function FileChangesHeader({ diffs, onOpenDiffEditor }: Props) {
  const t = useLocale();
  const [expanded, setExpanded] = useState(false);

  const totalAdditions = diffs.reduce((sum, d) => sum + d.additions, 0);
  const totalDeletions = diffs.reduce((sum, d) => sum + d.deletions, 0);

  return (
    <div className={styles.root}>
      <div className={styles.bar} onClick={() => setExpanded((s) => !s)} title={t["fileChanges.toggle"]}>
        <DiffIcon className={styles.icon} width={14} height={14} />
        <span className={styles.label}>{t["fileChanges.title"]}</span>
        <span className={styles.count}>{diffs.length}</span>
        <span className={styles.stats}>
          {totalAdditions > 0 && <span className={styles.statAdd}>+{totalAdditions}</span>}
          {totalDeletions > 0 && <span className={styles.statRemove}>−{totalDeletions}</span>}
        </span>
        <span className={`${styles.chevron} ${expanded ? styles.expanded : ""}`}>
          <ChevronRightIcon />
        </span>
      </div>
      {expanded && (
        <div className={styles.list}>
          {diffs.map((diff) => (
            <FileChangeItem key={diff.file} diff={diff} onOpenDiffEditor={onOpenDiffEditor} />
          ))}
        </div>
      )}
    </div>
  );
}
