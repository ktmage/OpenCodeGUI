import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProviders } from "../../hooks/useProviders";
import { postMessage } from "../../vscode-api";

describe("useProviders", () => {
  // initial state
  context("初期状態の場合", () => {
    // providers is empty
    it("providers が空配列であること", () => {
      const { result } = renderHook(() => useProviders());
      expect(result.current.providers).toEqual([]);
    });

    // selectedModel is null
    it("selectedModel が null であること", () => {
      const { result } = renderHook(() => useProviders());
      expect(result.current.selectedModel).toBeNull();
    });

    // allProvidersData is null
    it("allProvidersData が null であること", () => {
      const { result } = renderHook(() => useProviders());
      expect(result.current.allProvidersData).toBeNull();
    });

    // contextLimit is 0
    it("contextLimit が 0 であること", () => {
      const { result } = renderHook(() => useProviders());
      expect(result.current.contextLimit).toBe(0);
    });
  });

  // handleModelSelect
  context("handleModelSelect を呼んだ場合", () => {
    // updates selectedModel
    it("selectedModel が更新されること", () => {
      const { result } = renderHook(() => useProviders());
      const model = { providerID: "openai", modelID: "gpt-4" };
      act(() => result.current.handleModelSelect(model));
      expect(result.current.selectedModel).toEqual(model);
    });

    // sends setModel message
    it("setModel メッセージを送信すること", () => {
      const { result } = renderHook(() => useProviders());
      const model = { providerID: "openai", modelID: "gpt-4" };
      act(() => result.current.handleModelSelect(model));
      expect(postMessage).toHaveBeenCalledWith({ type: "setModel", model: "openai/gpt-4" });
    });
  });

  // contextLimit derivation
  context("providers と selectedModel が設定されている場合", () => {
    // calculates context limit from provider model
    it("モデルのコンテキストリミットを返すこと", () => {
      const { result } = renderHook(() => useProviders());
      const providers = [
        {
          id: "openai",
          models: {
            "gpt-4": { limit: { context: 128000 } },
          },
        },
      ] as any[];
      act(() => {
        result.current.setProviders(providers);
        result.current.setSelectedModel({ providerID: "openai", modelID: "gpt-4" });
      });
      expect(result.current.contextLimit).toBe(128000);
    });
  });

  // setters
  context("setters でステートを更新する場合", () => {
    // setProviders updates providers
    it("setProviders で providers を設定できること", () => {
      const { result } = renderHook(() => useProviders());
      const providers = [{ id: "anthropic", models: {} }] as any[];
      act(() => result.current.setProviders(providers));
      expect(result.current.providers).toEqual(providers);
    });

    // setAllProvidersData updates allProvidersData
    it("setAllProvidersData で allProvidersData を設定できること", () => {
      const { result } = renderHook(() => useProviders());
      const data = { anthropic: { name: "Anthropic", models: {} } } as any;
      act(() => result.current.setAllProvidersData(data));
      expect(result.current.allProvidersData).toEqual(data);
    });

    // setSelectedModel with function updater
    it("setSelectedModel に関数を渡してモデルを設定できること", () => {
      const { result } = renderHook(() => useProviders());
      act(() => result.current.setSelectedModel(() => ({ providerID: "openai", modelID: "gpt-4o" })));
      expect(result.current.selectedModel).toEqual({ providerID: "openai", modelID: "gpt-4o" });
    });
  });
});
