import { useCallback, useMemo, useState } from "react";
import type { LocaleSetting } from "../locales";
import { getStrings, resolveLocale } from "../locales";
import { getPersistedState, setPersistedState } from "../vscode-api";

export function useLocale() {
  const [localeSetting, setLocaleSetting] = useState<LocaleSetting>(
    () => (getPersistedState()?.localeSetting as LocaleSetting) ?? "auto",
  );
  const [vscodeLanguage, setVscodeLanguage] = useState("en");

  const resolvedLocale = useMemo(() => resolveLocale(localeSetting, vscodeLanguage), [localeSetting, vscodeLanguage]);
  const strings = useMemo(() => getStrings(resolvedLocale), [resolvedLocale]);

  const handleLocaleSettingChange = useCallback((setting: LocaleSetting) => {
    setLocaleSetting(setting);
    setPersistedState({ ...getPersistedState(), localeSetting: setting });
  }, []);

  return {
    localeSetting,
    vscodeLanguage,
    setVscodeLanguage,
    resolvedLocale,
    strings,
    handleLocaleSettingChange,
  } as const;
}
