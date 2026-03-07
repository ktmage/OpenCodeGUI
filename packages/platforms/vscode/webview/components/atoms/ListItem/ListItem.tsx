import type { ReactNode } from "react";
import styles from "./ListItem.module.css";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
  focused?: boolean;
};

/**
 * タイトル + 説明テキストを縦積みで表示する汎用リスト行。
 * icon を指定するとタイトル左にアイコンが描画される。
 */
export function ListItem({ title, description, icon, onClick, className, focused }: Props) {
  const classes = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={classes} onClick={onClick} data-focused={focused || undefined}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        {description && <span className={styles.description}>{description}</span>}
      </div>
    </div>
  );
}
