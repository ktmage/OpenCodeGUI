import { useLocale } from "../../../locales";
import type { LocaleSetting } from "../../../locales";
import { IconButton } from "../../atoms/IconButton";
import { CloseIcon, FileIcon } from "../../atoms/icons";
import { LinkButton } from "../../atoms/LinkButton";
import styles from "./ToolConfigPanel.module.css";

type Props = {
  paths: { home: string; config: string; state: string; directory: string } | null;
  onOpenConfigFile: (filePath: string) => void;
  onClose: () => void;
  localeSetting: LocaleSetting;
  onLocaleSettingChange: (setting: LocaleSetting) => void;
};

export function ToolConfigPanel({ paths, onOpenConfigFile, onClose, localeSetting, onLocaleSettingChange }: Props) {
  const t = useLocale();

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>{t["config.title"]}</span>
        <IconButton variant="muted" size="sm" onClick={onClose} title={t["config.close"]}>
          <CloseIcon />
        </IconButton>
      </div>

      <div className={styles.body}>
        {/* Language Setting */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t["config.language"]}</div>
          <div>
            {(["auto", "en", "ja"] as const).map((opt) => {
              const label =
                opt === "auto" ? t["config.langAuto"] : opt === "en" ? t["config.langEn"] : t["config.langJa"];
              return (
                <label key={opt} className={`${styles.toggle} ${styles.toolItem}`}>
                  <input
                    type="radio"
                    name="locale"
                    checked={localeSetting === opt}
                    onChange={() => onLocaleSettingChange(opt)}
                  />
                  <span className={styles.toolName}>{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 設定ファイルへのリンク */}
      {paths && (
        <div className={styles.footer}>
          <LinkButton onClick={() => onOpenConfigFile(`${paths.directory}/opencode.json`)}>
            <FileIcon />
            {t["config.projectConfig"]}
          </LinkButton>
          <LinkButton onClick={() => onOpenConfigFile(`${paths.config}/opencode.json`)}>
            <FileIcon />
            {t["config.globalConfig"]}
          </LinkButton>
        </div>
      )}
    </div>
  );
}
