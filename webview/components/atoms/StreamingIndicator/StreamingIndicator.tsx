import styles from "./StreamingIndicator.module.css";

export function StreamingIndicator() {
  return (
    <div className={styles.root} data-testid="streaming-indicator">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </div>
  );
}
