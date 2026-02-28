import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import styles from "./IconButton.module.css";

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
export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "default", size = "md", className, children, ...rest }, ref) => {
    const classes = [styles.root, variant !== "default" && styles[variant], size !== "md" && styles[size], className]
      .filter(Boolean)
      .join(" ");

    return (
      <button type="button" ref={ref} className={classes} {...rest}>
        {children}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
