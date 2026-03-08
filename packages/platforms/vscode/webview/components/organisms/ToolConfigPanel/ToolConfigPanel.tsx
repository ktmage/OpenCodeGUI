import type { SoundEventSetting, SoundEventType, SoundSettings } from "@opencodegui/core";
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
  soundSettings: SoundSettings;
  onSoundSettingChange: (eventType: SoundEventType, setting: Partial<SoundEventSetting>) => void;
};

export function ToolConfigPanel({
  paths,
  onOpenConfigFile,
  onClose,
  localeSetting,
  onLocaleSettingChange,
  soundSettings,
  onSoundSettingChange,
}: Props) {
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

        {/* Sound Notification Setting */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t["config.sound"]}</div>
          <div>
            {(["responseComplete", "permissionRequest", "questionAsked", "error"] as const).map((eventType) => {
              const labelMap = {
                responseComplete: t["config.soundResponseComplete"],
                permissionRequest: t["config.soundPermissionRequest"],
                questionAsked: t["config.soundQuestionAsked"],
                error: t["config.soundError"],
              } as const;
              const enabled = soundSettings[eventType]?.enabled ?? true;
              const volume = soundSettings[eventType]?.volume ?? 0.2;
              return (
                <div key={eventType} className={styles.soundItem}>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => onSoundSettingChange(eventType, { enabled: e.target.checked })}
                    />
                    <span className={styles.toolName}>{labelMap[eventType]}</span>
                  </label>
                  {enabled && (
                    <div className={styles.volumeRow}>
                      <span className={styles.volumeLabel}>{t["config.soundVolume"]}</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={Math.round(volume * 100)}
                        onChange={(e) => onSoundSettingChange(eventType, { volume: Number(e.target.value) / 100 })}
                        className={styles.volumeSlider}
                      />
                    </div>
                  )}
                </div>
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
