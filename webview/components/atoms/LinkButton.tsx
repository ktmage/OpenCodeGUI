import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
  /** ボタン内容（icon + テキスト等） */
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

/**
 * リンクスタイルのボタン。
 * テキストリンク色・背景なし・icon + text の組み合わせで使用する。
 */
export function LinkButton({ className, children, ...rest }: Props) {
  const classes = ["link-button", className].filter(Boolean).join(" ");

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
