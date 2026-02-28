type Props = {
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
};

/**
 * タイトル + 説明テキストを縦積みで表示する汎用リスト行。
 */
export function ListItem({ title, description, onClick, className }: Props) {
  const classes = ["list-item", className].filter(Boolean).join(" ");

  return (
    <div className={classes} onClick={onClick}>
      <span className="list-item-title">{title}</span>
      {description && <span className="list-item-description">{description}</span>}
    </div>
  );
}
