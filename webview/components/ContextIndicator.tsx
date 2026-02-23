import { useState, useRef, useEffect, useCallback } from "react";
import { useLocale } from "../locales";

type Props = {
  inputTokens: number;
  contextLimit: number;
  onCompress: () => void;
  isCompressing: boolean;
};

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function ContextIndicator({ inputTokens, contextLimit, onCompress, isCompressing }: Props) {
  const t = useLocale();
  const [showPopup, setShowPopup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 外部クリックでポップアップを閉じる
  useEffect(() => {
    if (!showPopup) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPopup]);

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
  const color =
    percent >= 80
      ? "var(--vscode-editorWarning-foreground)"
      : "var(--vscode-textLink-foreground)";

  return (
    <div className="context-indicator-container" ref={containerRef}>
      <button
        className="context-indicator-button"
        onClick={handleClick}
        title={t["context.title"](percent)}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
      </button>

      {showPopup && (
        <div className="context-indicator-popup">
          <div className="context-indicator-popup-title">{t["context.windowUsage"]}</div>
          <div className="context-indicator-popup-row">
            <span>{t["context.inputTokens"]}</span>
            <span>{formatTokenCount(inputTokens)}</span>
          </div>
          <div className="context-indicator-popup-row">
            <span>{t["context.contextLimit"]}</span>
            <span>{formatTokenCount(contextLimit)}</span>
          </div>
          <div className="context-indicator-popup-bar">
            <div
              className="context-indicator-popup-bar-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
          <button
            className="context-indicator-compress-button"
            onClick={() => { onCompress(); setShowPopup(false); }}
            disabled={isCompressing}
          >
            {isCompressing ? t["context.compressing"] : t["context.compress"]}
          </button>
        </div>
      )}
    </div>
  );
}
