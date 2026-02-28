import { useCallback, useRef, useState } from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useLocale } from "../../../locales";
import { ActionButton } from "../ActionButton";
import { IconButton } from "../IconButton";
import styles from "./ContextIndicator.module.css";

type Props = {
  inputTokens: number;
  contextLimit: number;
  onCompress: () => void;
  isCompressing: boolean;
};

export function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ContextIndicator({ inputTokens, contextLimit, onCompress, isCompressing }: Props) {
  const t = useLocale();
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setShowPopup(false), showPopup);

  const handleClick = useCallback(() => {
    setShowPopup((s) => !s);
  }, []);

  if (contextLimit <= 0) return null;

  const ratio = Math.min(inputTokens / contextLimit, 1);
  const percent = Math.round(ratio * 100);

  // 0% の場合はボタン自体を非表示
  if (percent === 0) return null;

  // 円形プログレスリング (SVG)
  const size = 22;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - ratio);

  // 使用率に応じた色
  const color = percent >= 80 ? "var(--vscode-editorWarning-foreground)" : "var(--vscode-textLink-foreground)";

  return (
    <div className={styles.container} ref={containerRef}>
      <IconButton
        variant="muted"
        size="sm"
        className={styles.button}
        onClick={handleClick}
        title={t["context.title"](percent)}
      >
        <svg aria-hidden="true" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* 背景リング */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--vscode-input-border)"
            strokeWidth={strokeWidth}
            opacity={0.4}
          />
          {/* プログレスリング */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
      </IconButton>

      {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popupTitle}>{t["context.windowUsage"]}</div>
          <div className={styles.popupRow}>
            <span>{t["context.inputTokens"]}</span>
            <span>{formatTokenCount(inputTokens)}</span>
          </div>
          <div className={styles.popupRow}>
            <span>{t["context.contextLimit"]}</span>
            <span>{formatTokenCount(contextLimit)}</span>
          </div>
          <div className={styles.bar}>
            <div className={styles.barFill} style={{ width: `${percent}%` }} />
          </div>
          <ActionButton
            variant="secondary"
            size="sm"
            className={styles.compressButton}
            onClick={() => {
              onCompress();
              setShowPopup(false);
            }}
            disabled={isCompressing}
          >
            {isCompressing ? t["context.compressing"] : t["context.compress"]}
          </ActionButton>
        </div>
      )}
    </div>
  );
}
