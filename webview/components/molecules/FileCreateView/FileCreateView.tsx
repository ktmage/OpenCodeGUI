import { useLocale } from "../../../locales";
import styles from "../DiffView/DiffView.module.css";

type Props = {
  content: string;
};

export function FileCreateView({ content }: Props) {
  const t = useLocale();
  const lines = content.split("\n");
  const displayLines = lines.length > 30 ? [...lines.slice(0, 30), t["tool.moreLines"](lines.length - 30)] : lines;
  return (
    <div className={styles.root} data-testid="diff-view">
      <div className={styles.stats}>
        <span className={styles.statAdd}>{t["tool.addLines"](lines.length)}</span>
      </div>
      <div className={styles.lines}>
        {displayLines.map((line, i) => (
          <div key={i} className={`${styles.line} ${styles.lineAdd}`}>
            <span className={styles.lineMarker}>+</span>
            <span className={styles.lineText}>{line || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
