import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLocale } from "../../hooks/useLocale";

describe("useLocale", () => {
  // initial state
  context("初期状態の場合", () => {
    // localeSetting defaults to "auto"
    it("localeSetting が 'auto' であること", () => {
      const { result } = renderHook(() => useLocale());
      expect(result.current.localeSetting).toBe("auto");
    });

    // vscodeLanguage defaults to "en"
    it("vscodeLanguage が 'en' であること", () => {
      const { result } = renderHook(() => useLocale());
      expect(result.current.vscodeLanguage).toBe("en");
    });

    // strings is an object (locale strings loaded)
    it("strings がオブジェクトであること", () => {
      const { result } = renderHook(() => useLocale());
      expect(typeof result.current.strings).toBe("object");
    });
  });

  // handleLocaleSettingChange
  context("handleLocaleSettingChange を呼んだ場合", () => {
    // updates localeSetting
    it("localeSetting が更新されること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.handleLocaleSettingChange("ja"));
      expect(result.current.localeSetting).toBe("ja");
    });

    // changes resolved strings when set to "ja"
    it("strings が日本語に切り替わること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.handleLocaleSettingChange("ja"));
      // resolvedLocale should be "ja"
      expect(result.current.resolvedLocale).toBe("ja");
    });
  });

  // setVscodeLanguage
  context("setVscodeLanguage で言語を設定した場合", () => {
    // updates vscodeLanguage
    it("vscodeLanguage が更新されること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.setVscodeLanguage("ja"));
      expect(result.current.vscodeLanguage).toBe("ja");
    });

    // resolves auto setting to vscodeLanguage
    it("localeSetting が auto の場合に vscodeLanguage に基づいてロケールを解決すること", () => {
      const { result } = renderHook(() => useLocale());
      // localeSetting is "auto" by default
      act(() => result.current.setVscodeLanguage("ja"));
      expect(result.current.resolvedLocale).toBe("ja");
    });
  });
});
