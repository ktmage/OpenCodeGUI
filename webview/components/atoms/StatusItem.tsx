export type BadgeVariant = "danger" | "muted";

type Props = {
  /** 先頭に表示するインジケータ文字（例: "✓", "○"） */
  indicator: string;
  /** メインコンテンツテキスト */
  content: string;
  /** オプショナルバッジ（ラベル + バリアント） */
  badge?: { label: string; variant?: BadgeVariant };
  /** 完了状態（opacity 低下 + 取り消し線） */
  isDone?: boolean;
  className?: string;
};

/**
 * ステータスインジケータ + コンテンツ + オプショナルバッジの読み取り専用行。
 */
export function StatusItem({ indicator, content, badge, isDone, className }: Props) {
  const classes = ["status-item", isDone && "done", className].filter(Boolean).join(" ");

  return (
    <li className={classes}>
      <span className="status-item-indicator">{indicator}</span>
      <span className="status-item-content">{content}</span>
      {badge && (
        <span className={`status-item-badge ${badge.variant ?? ""}`}>{badge.label}</span>
      )}
    </li>
  );
}
