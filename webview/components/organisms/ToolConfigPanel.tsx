import { useEffect, useRef } from "react";
import type { LocaleSetting } from "../../locales";
import { useLocale } from "../../locales";
import { CloseIcon, FileIcon } from "../atoms/icons";

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
        <button type="button" className="tool-config-close" onClick={onClose} title={t["config.close"]}>
          <CloseIcon />
        </button>
      </div>

      <div className="tool-config-body">
        {/* Language Setting */}
        <div className="tool-config-section">
          <div className="tool-config-section-title">{t["config.language"]}</div>
          <div className="tool-config-locale-options">
            {(["auto", "en", "ja"] as const).map((opt) => {
              const label =
                opt === "auto" ? t["config.langAuto"] : opt === "en" ? t["config.langEn"] : t["config.langJa"];
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
            type="button"
            className="tool-config-link"
            onClick={() => onOpenConfigFile(`${paths.directory}/opencode.json`)}
          >
            <FileIcon />
            {t["config.projectConfig"]}
          </button>
          <button
            type="button"
            className="tool-config-link"
            onClick={() => onOpenConfigFile(`${paths.config}/opencode.json`)}
          >
            <FileIcon />
            {t["config.globalConfig"]}
          </button>
        </div>
      )}
    </div>
  );
}
