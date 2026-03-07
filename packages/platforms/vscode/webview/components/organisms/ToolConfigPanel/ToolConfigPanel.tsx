import type { LocaleSetting } from "../../../locales";
import { useLocale } from "../../../locales";
import { IconButton } from "../../atoms/IconButton";
import { CloseIcon, FileIcon } from "../../atoms/icons";
import { LinkButton } from "../../atoms/LinkButton";
import styles from "./ToolConfigPanel.module.css";

type Props = {
  paths: { home?: string; config: string; state: string; directory: string } | null;
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
            {(["auto", "en", "ja", "zh-cn", "ko", "zh-tw", "es", "pt-br", "ru"] as const).map((opt) => {
              const labelMap = {
                auto: t["config.langAuto"],
                en: t["config.langEn"],
                ja: t["config.langJa"],
                "zh-cn": t["config.langZhCn"],
                ko: t["config.langKo"],
                "zh-tw": t["config.langZhTw"],
                es: t["config.langEs"],
                "pt-br": t["config.langPtBr"],
                ru: t["config.langRu"],
              } as const;
              return (
                <label key={opt} className={`${styles.toggle} ${styles.toolItem}`}>
                  <input
                    type="radio"
                    name="locale"
                    checked={localeSetting === opt}
                    onChange={() => onLocaleSettingChange(opt)}
                  />
                  <span className={styles.toolName}>{labelMap[opt]}</span>
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
