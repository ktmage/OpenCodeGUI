import type { Provider } from "@opencode-ai/sdk";
import { useCallback, useMemo, useState } from "react";
import type { AllProvidersData } from "../vscode-api";
import { postMessage } from "../vscode-api";

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [allProvidersData, setAllProvidersData] = useState<AllProvidersData | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ providerID: string; modelID: string } | null>(null);

  // 選択中のモデルのコンテキストリミットを算出
  const contextLimit = useMemo(() => {
    if (!selectedModel) return 0;
    const provider = providers.find((p) => p.id === selectedModel.providerID);
    if (!provider) return 0;
    const model = provider.models[selectedModel.modelID];
    return model?.limit?.context ?? 0;
  }, [providers, selectedModel]);

  const handleModelSelect = useCallback((model: { providerID: string; modelID: string }) => {
    setSelectedModel(model);
    postMessage({ type: "setModel", model: `${model.providerID}/${model.modelID}` });
  }, []);

  return {
    providers,
    setProviders,
    allProvidersData,
    setAllProvidersData,
    selectedModel,
    setSelectedModel,
    contextLimit,
    handleModelSelect,
  } as const;
}
