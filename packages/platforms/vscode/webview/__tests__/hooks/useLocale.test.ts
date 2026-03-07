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

  // resolveLocale for zh-cn
  context("setVscodeLanguage で 'zh-cn' を設定した場合", () => {
    // resolves to zh-cn
    it("resolvedLocale が 'zh-cn' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.setVscodeLanguage("zh-cn"));
      expect(result.current.resolvedLocale).toBe("zh-cn");
    });
  });

  // resolveLocale for ko
  context("setVscodeLanguage で 'ko' を設定した場合", () => {
    // resolves to ko
    it("resolvedLocale が 'ko' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.setVscodeLanguage("ko"));
      expect(result.current.resolvedLocale).toBe("ko");
    });
  });

  // resolveLocale for zh-tw
  context("setVscodeLanguage で 'zh-tw' を設定した場合", () => {
    // resolves to zh-tw
    it("resolvedLocale が 'zh-tw' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.setVscodeLanguage("zh-tw"));
      expect(result.current.resolvedLocale).toBe("zh-tw");
    });
  });

  // resolveLocale for es
  context("setVscodeLanguage で 'es' を設定した場合", () => {
    // resolves to es
    it("resolvedLocale が 'es' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.setVscodeLanguage("es"));
      expect(result.current.resolvedLocale).toBe("es");
    });
  });

  // resolveLocale for pt-br
  context("setVscodeLanguage で 'pt-br' を設定した場合", () => {
    // resolves to pt-br
    it("resolvedLocale が 'pt-br' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.setVscodeLanguage("pt-br"));
      expect(result.current.resolvedLocale).toBe("pt-br");
    });
  });

  // resolveLocale for ru
  context("setVscodeLanguage で 'ru' を設定した場合", () => {
    // resolves to ru
    it("resolvedLocale が 'ru' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.setVscodeLanguage("ru"));
      expect(result.current.resolvedLocale).toBe("ru");
    });
  });

  // handleLocaleSettingChange with new locales
  context("handleLocaleSettingChange で直接ロケールを指定した場合", () => {
    // sets zh-cn directly
    it("resolvedLocale が 'zh-cn' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.handleLocaleSettingChange("zh-cn"));
      expect(result.current.resolvedLocale).toBe("zh-cn");
    });

    // sets ko directly
    it("resolvedLocale が 'ko' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.handleLocaleSettingChange("ko"));
      expect(result.current.resolvedLocale).toBe("ko");
    });

    // sets zh-tw directly
    it("resolvedLocale が 'zh-tw' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.handleLocaleSettingChange("zh-tw"));
      expect(result.current.resolvedLocale).toBe("zh-tw");
    });

    // sets es directly
    it("resolvedLocale が 'es' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.handleLocaleSettingChange("es"));
      expect(result.current.resolvedLocale).toBe("es");
    });

    // sets pt-br directly
    it("resolvedLocale が 'pt-br' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.handleLocaleSettingChange("pt-br"));
      expect(result.current.resolvedLocale).toBe("pt-br");
    });

    // sets ru directly
    it("resolvedLocale が 'ru' になること", () => {
      const { result } = renderHook(() => useLocale());
      act(() => result.current.handleLocaleSettingChange("ru"));
      expect(result.current.resolvedLocale).toBe("ru");
    });
  });
});
