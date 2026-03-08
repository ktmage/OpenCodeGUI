import type { AgentEvent, SoundEventSetting, SoundEventType, SoundSettings } from "@opencodegui/core";
import { useCallback, useRef, useState } from "react";
import { getPersistedState, setPersistedState } from "../vscode-api";

const DEFAULT_SETTING: Required<SoundEventSetting> = { enabled: true, volume: 0.2 };

/** イベントごとの設定を取得する。未設定時はデフォルト値を返す */
function getEffectiveSetting(settings: SoundSettings, eventType: SoundEventType): Required<SoundEventSetting> {
  const s = settings[eventType];
  return {
    enabled: s?.enabled ?? DEFAULT_SETTING.enabled,
    volume: s?.volume ?? DEFAULT_SETTING.volume,
  };
}

// --- Web Audio API で通知音を生成する ---

type ToneStep = { frequency: number; duration: number };

const TONE_PATTERNS: Record<SoundEventType, ToneStep[]> = {
  // 上昇する 2 音（完了を連想させる）
  responseComplete: [
    { frequency: 523, duration: 0.1 },
    { frequency: 659, duration: 0.1 },
  ],
  // 同音 2 回（注意を引く）
  permissionRequest: [
    { frequency: 880, duration: 0.08 },
    { frequency: 880, duration: 0.08 },
  ],
  // 上昇する 3 音（質問・選択を連想させる）
  questionAsked: [
    { frequency: 660, duration: 0.08 },
    { frequency: 784, duration: 0.08 },
    { frequency: 880, duration: 0.1 },
  ],
  // 下降する 2 音（エラーを連想させる）
  error: [
    { frequency: 440, duration: 0.12 },
    { frequency: 330, duration: 0.12 },
  ],
};

/** OscillatorNode でトーンパターンを再生する */
function playTone(eventType: SoundEventType, volume: number): void {
  const ctx = new AudioContext();
  const gainNode = ctx.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(ctx.destination);

  const steps = TONE_PATTERNS[eventType];
  let offset = 0;
  for (const step of steps) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = step.frequency;
    osc.connect(gainNode);
    osc.start(ctx.currentTime + offset);
    osc.stop(ctx.currentTime + offset + step.duration);
    offset += step.duration + 0.06; // 音と音の間に 60ms の間隔
  }
}

export function useSoundNotification() {
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(() => getPersistedState()?.soundSettings ?? {});

  // session.status の busy → idle 遷移を検出するために前回のステータスを追跡する
  const prevBusyRef = useRef(false);

  const handleSoundSettingChange = useCallback((eventType: SoundEventType, setting: Partial<SoundEventSetting>) => {
    setSoundSettings((prev) => {
      const next: SoundSettings = {
        ...prev,
        [eventType]: { ...prev[eventType], ...setting },
      };
      setPersistedState({ ...getPersistedState(), soundSettings: next });
      return next;
    });
  }, []);

  const handleSoundEvent = useCallback(
    (event: AgentEvent) => {
      let eventType: SoundEventType | null = null;

      switch (event.type) {
        case "session.status": {
          const wasBusy = prevBusyRef.current;
          const isNowIdle = event.properties.status.type === "idle";
          prevBusyRef.current = event.properties.status.type === "busy";
          // busy → idle の遷移のみで応答完了とみなす
          if (wasBusy && isNowIdle) {
            eventType = "responseComplete";
          }
          break;
        }
        case "permission.updated":
          eventType = "permissionRequest";
          break;
        case "question.asked":
          eventType = "questionAsked";
          break;
        case "session.error":
          eventType = "error";
          break;
      }

      if (!eventType) return;

      const setting = getEffectiveSetting(soundSettings, eventType);
      if (setting.enabled) {
        playTone(eventType, setting.volume);
      }
    },
    [soundSettings],
  );

  return {
    soundSettings,
    handleSoundSettingChange,
    handleSoundEvent,
  } as const;
}
