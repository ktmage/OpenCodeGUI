import type { ProviderInfo } from "@opencodegui/core";
import { useCallback, useState } from "react";
import type { AllProvidersData } from "../vscode-api";
import { postMessage } from "../vscode-api";

export function useProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [allProvidersData, setAllProvidersData] = useState<AllProvidersData | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ providerID: string; modelID: string } | null>(null);

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
    handleModelSelect,
  } as const;
}
