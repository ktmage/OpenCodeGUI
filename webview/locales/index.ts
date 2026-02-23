import { createContext, useContext } from "react";
import { en } from "./en";
import { ja } from "./ja";

export type SupportedLocale = "en" | "ja";
export type LocaleSetting = "auto" | SupportedLocale;

const locales: Record<SupportedLocale, typeof en> = { en, ja };

export function resolveLocale(setting: LocaleSetting, vscodeLanguage: string): SupportedLocale {
  if (setting !== "auto") return setting;
  // vscode.env.language は "ja", "en", "zh-cn" など
  if (vscodeLanguage.startsWith("ja")) return "ja";
  return "en";
}

export function getStrings(locale: SupportedLocale): typeof en {
  return locales[locale] ?? locales.en;
}

// React Context
const LocaleContext = createContext<typeof en>(en);

export const LocaleProvider = LocaleContext.Provider;

export function useLocale(): typeof en {
  return useContext(LocaleContext);
}
