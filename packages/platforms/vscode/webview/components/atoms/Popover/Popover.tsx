import { type ReactNode, useRef, useState } from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import styles from "./Popover.module.css";

type Props = {
  /** トリガーボタンを描画する関数。open 状態と toggle 関数を受け取る。 */
  trigger: (params: { open: boolean; toggle: () => void }) => ReactNode;
  /** ポップアップパネルの中身。close 関数を受け取る。 */
  panel: (params: { close: () => void }) => ReactNode;
  /** ラッパー div に追加する className */
  className?: string;
};

/**
 * トリガーボタンとポップアップパネルを1つの div で包み、
 * 外側クリックで閉じる挙動を統一的に提供する。
 */
export function Popover({ trigger, panel, className }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  const toggle = () => setOpen((s) => !s);
  const close = () => setOpen(false);

  const classes = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={classes} ref={containerRef}>
      {trigger({ open, toggle })}
      {open && panel({ close })}
    </div>
  );
}
