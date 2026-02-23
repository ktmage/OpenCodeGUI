import { useState, useRef, useEffect, useMemo } from "react";
import type { Provider } from "@opencode-ai/sdk";
import type { AllProvidersData, ProviderInfo, ModelInfo } from "../vscode-api";

type Props = {
  providers: Provider[];
  allProvidersData: AllProvidersData | null;
  selectedModel: { providerID: string; modelID: string } | null;
  onSelect: (model: { providerID: string; modelID: string }) => void;
};

function formatContextK(context: number): string {
  if (context >= 1_000_000) return `${(context / 1_000_000).toFixed(0)}M`;
  return `${Math.round(context / 1000)}K`;
}

function statusBadge(status?: string): string | null {
  if (!status || status === "active") return null;
  return status;
}

export function ModelSelector({ providers, allProvidersData, selectedModel, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [collapsedProviders, setCollapsedProviders] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // 表示用プロバイダーリスト: allProvidersData があればそちらを使い、なければ従来の providers を使う
  const allDisplayProviders = useMemo(() => {
    if (!allProvidersData) {
      return providers.map((p) => ({
        id: p.id,
        name: p.name,
        connected: true,
        models: Object.values(p.models).map((m) => ({
          id: m.id,
          name: m.name,
          limit: m.limit,
          status: m.status === "active" ? undefined : m.status,
        })),
      }));
    }

    const connectedSet = new Set(allProvidersData.connected);
    return allProvidersData.all
      .filter((p: ProviderInfo) => Object.keys(p.models).length > 0)
      .map((p: ProviderInfo) => ({
        id: p.id,
        name: p.name,
        connected: connectedSet.has(p.id),
        models: Object.values(p.models).map((m: ModelInfo) => ({
          id: m.id,
          name: m.name,
          limit: m.limit,
          status: m.status,
        })),
      }));
  }, [providers, allProvidersData]);

  // showAll が false のときは connected なプロバイダーのみ
  const displayProviders = useMemo(() => {
    if (showAll) return allDisplayProviders;
    return allDisplayProviders.filter((p) => p.connected);
  }, [allDisplayProviders, showAll]);

  const hasDisconnected = useMemo(
    () => allDisplayProviders.some((p) => !p.connected),
    [allDisplayProviders],
  );

  const selectedModelName = useMemo(() => {
    if (!selectedModel) return "Select model";
    for (const p of allDisplayProviders) {
      const model = p.models.find((m) => m.id === selectedModel.modelID && p.id === selectedModel.providerID);
      if (model) return model.name || selectedModel.modelID;
    }
    return selectedModel.modelID;
  }, [selectedModel, allDisplayProviders]);

  const toggleProvider = (id: string) => {
    setCollapsedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="model-selector" ref={containerRef}>
      <button
        className="model-selector-button"
        onClick={() => setOpen((s) => !s)}
        title="Select model"
      >
        <span className="model-selector-label">{selectedModelName}</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 10.5l-5-5h10l-5 5z" />
        </svg>
      </button>
      {open && (
        <div className="model-panel">
          <div className="model-panel-body">
            {displayProviders.map((provider) => {
              if (provider.models.length === 0) return null;
              const isCollapsed = collapsedProviders.has(provider.id);
              return (
                <div key={provider.id} className="model-panel-section">
                  <div
                    className={`model-panel-section-title ${!provider.connected ? "disconnected" : ""}`}
                    onClick={() => toggleProvider(provider.id)}
                  >
                    <span className="model-panel-section-chevron">
                      {isCollapsed ? "▸" : "▾"}
                    </span>
                    <span className="model-panel-section-name">{provider.name}</span>
                    {!provider.connected && (
                      <span className="model-panel-section-badge">Not connected</span>
                    )}
                  </div>
                  {!isCollapsed && provider.models.map((model) => {
                    const isSelected =
                      selectedModel?.providerID === provider.id &&
                      selectedModel?.modelID === model.id;
                    const disabled = !provider.connected;
                    const badge = statusBadge(model.status);
                    return (
                      <div
                        key={model.id}
                        className={`model-panel-item${isSelected ? " active" : ""}${disabled ? " disabled" : ""}`}
                        onClick={() => {
                          if (disabled) return;
                          onSelect({ providerID: provider.id, modelID: model.id });
                          setOpen(false);
                        }}
                      >
                        <span className="model-panel-item-check">
                          {isSelected ? "✓" : ""}
                        </span>
                        <span className="model-panel-item-name">
                          {model.name || model.id}
                          {badge && <span className={`model-panel-item-badge ${badge}`}>{badge}</span>}
                        </span>
                        {model.limit && (
                          <span className="model-panel-item-meta">
                            <span className="model-panel-item-context">
                              {formatContextK(model.limit.context)}
                            </span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {hasDisconnected && (
            <div className="model-panel-footer">
              <button
                className="model-panel-link"
                onClick={() => setShowAll((s) => !s)}
                title={showAll ? "Hide disconnected providers" : "Show all providers"}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  {showAll ? (
                    <path d="M8 3C4.5 3 1.7 5.1 0.5 8c1.2 2.9 4 5 7.5 5s6.3-2.1 7.5-5c-1.2-2.9-4-5-7.5-5zm0 8.5C5.5 11.5 3.5 10 2.2 8 3.5 6 5.5 4.5 8 4.5S12.5 6 13.8 8c-1.3 2-3.3 3.5-5.8 3.5zM8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zm0 4a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                  ) : (
                    <path d="M8 3C4.5 3 1.7 5.1 0.5 8c.5 1.2 1.3 2.3 2.3 3.1l1-1c-.7-.6-1.3-1.3-1.7-2.1C3.5 6 5.5 4.5 8 4.5c.8 0 1.6.2 2.3.4l1.1-1.1C10.4 3.3 9.2 3 8 3zm4.9 1.9l-1 1c.7.6 1.3 1.3 1.7 2.1-1.3 2-3.3 3.5-5.8 3.5-.8 0-1.5-.1-2.2-.4l-1.1 1.1c1 .5 2.1.8 3.3.8 3.5 0 6.3-2.1 7.5-5-.6-1.3-1.4-2.4-2.4-3.1zM2.3 1.3L1 2.6l2.5 2.5C2 6.2 1 7 0.5 8c1.2 2.9 4 5 7.5 5 1.1 0 2.2-.2 3.1-.6l2.3 2.3 1.3-1.3L2.3 1.3zM8 11.5c-2.5 0-4.5-1.5-5.8-3.5.5-.9 1.2-1.7 2-2.3l1.5 1.5c-.1.3-.2.5-.2.8a2.5 2.5 0 003.3 2.3l1.1 1.1c-.6.1-1.2.1-1.9.1z" />
                  )}
                </svg>
                <span>{showAll ? "Connected only" : "Show all providers"}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
