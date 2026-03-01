import styles from "./ListItem.module.css";

type Props = {
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  focused?: boolean;
};

/**
 * タイトル + 説明テキストを縦積みで表示する汎用リスト行。
 */
export function ListItem({ title, description, onClick, className, focused }: Props) {
  const classes = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={classes} onClick={onClick} data-focused={focused || undefined}>
      <span className={styles.title}>{title}</span>
      {description && <span className={styles.description}>{description}</span>}
    </div>
  );
}
