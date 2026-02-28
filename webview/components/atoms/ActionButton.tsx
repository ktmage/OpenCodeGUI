import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
  /** 色のバリエーション */
  variant?: "primary" | "secondary" | "ghost";
  /** サイズ */
  size?: "sm" | "md";
  /** ボタン内容（テキスト等） */
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

/**
 * 背景色ありのアクションボタン。
 * テキスト表示用。Primary（青）/ Secondary（グレー）/ Ghost（枠線のみ）の3バリエーション。
 */
export function ActionButton({ variant = "primary", size = "md", className, children, ...rest }: Props) {
  const classes = [
    "action-button",
    variant !== "primary" && `action-button--${variant}`,
    size !== "md" && `action-button--${size}`,
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
