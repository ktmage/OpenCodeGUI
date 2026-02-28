import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
  /** 色のバリエーション */
  variant?: "default" | "muted" | "outlined";
  /** サイズ */
  size?: "sm" | "md";
  /** ボタン内容（アイコン等） */
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

/**
 * アイコンを表示する透明背景のボタン。
 * デザインはコンポーネントに内包され、レイアウト調整のみ `className` で行う。
 */
export function IconButton({ variant = "default", size = "md", className, children, ...rest }: Props) {
  const classes = [
    "icon-button",
    variant !== "default" && `icon-button--${variant}`,
    size !== "md" && `icon-button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
