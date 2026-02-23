import { useEffect, useRef } from "react";
import { useLocale } from "../locales";
import type { LocaleSetting } from "../locales";

type Props = {
  paths: { home: string; config: string; state: string; directory: string } | null;
  onOpenConfigFile: (filePath: string) => void;
  onClose: () => void;
  localeSetting: LocaleSetting;
  onLocaleSettingChange: (setting: LocaleSetting) => void;
};

export function ToolConfigPanel({ paths, onOpenConfigFile, onClose, localeSetting, onLocaleSettingChange }: Props) {
  const t = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div className="tool-config-panel" ref={panelRef}>
      <div className="tool-config-header">
        <span className="tool-config-title">{t["config.title"]}</span>
        <button className="tool-config-close" onClick={onClose} title={t["config.close"]}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707z" />
          </svg>
        </button>
      </div>

      <div className="tool-config-body">
        {/* Language Setting */}
        <div className="tool-config-section">
          <div className="tool-config-section-title">{t["config.language"]}</div>
          <div className="tool-config-locale-options">
            {(["auto", "en", "ja"] as const).map((opt) => {
              const label = opt === "auto" ? t["config.langAuto"] : opt === "en" ? t["config.langEn"] : t["config.langJa"];
              return (
                <label key={opt} className="tool-config-toggle tool-config-tool-item">
                  <input
                    type="radio"
                    name="locale"
                    checked={localeSetting === opt}
                    onChange={() => onLocaleSettingChange(opt)}
                  />
                  <span className="tool-config-tool-name">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 設定ファイルへのリンク */}
      {paths && (
        <div className="tool-config-footer">
          <button
            className="tool-config-link"
            onClick={() => onOpenConfigFile(`${paths.directory}/opencode.json`)}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.71 4.29l-3-3A1 1 0 0 0 10 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-.29-.71zM12 14H4V2h5v3a1 1 0 0 0 1 1h3v8z" />
            </svg>
            {t["config.projectConfig"]}
          </button>
          <button
            className="tool-config-link"
            onClick={() => onOpenConfigFile(`${paths.config}/opencode.json`)}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.71 4.29l-3-3A1 1 0 0 0 10 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-.29-.71zM12 14H4V2h5v3a1 1 0 0 0 1 1h3v8z" />
            </svg>
            {t["config.globalConfig"]}
          </button>
        </div>
      )}
    </div>
  );
}
