import { useLocale } from "../../locales";
import { ActionButton } from "../atoms/ActionButton";
import styles from "./EmptyState.module.css";

type Props = {
  onNewSession: () => void;
};

export function EmptyState({ onNewSession }: Props) {
  const t = useLocale();
  return (
    <div className={styles.root}>
      <div className={styles.title}>{t["empty.title"]}</div>
      <div className={styles.description}>{t["empty.description"]}</div>
      <ActionButton onClick={onNewSession}>
        {t["empty.newChat"]}
      </ActionButton>
    </div>
  );
}
