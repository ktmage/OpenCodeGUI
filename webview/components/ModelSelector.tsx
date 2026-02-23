import { useState, useRef, useEffect } from "react";
import type { Provider } from "@opencode-ai/sdk";

type Props = {
  providers: Provider[];
  selectedModel: { providerID: string; modelID: string } | null;
  onSelect: (model: { providerID: string; modelID: string }) => void;
};

export function ModelSelector({ providers, selectedModel, onSelect }: Props) {
  const [open, setOpen] = useState(false);
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

  const selectedModelName = (() => {
    if (!selectedModel) return "Select model";
    for (const provider of providers) {
      const model = provider.models[selectedModel.modelID];
      if (model && provider.id === selectedModel.providerID) {
        return model.name || selectedModel.modelID;
      }
    }
    return selectedModel.modelID;
  })();

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
        <div className="model-dropdown">
          {providers.map((provider) => {
            const models = Object.values(provider.models);
            if (models.length === 0) return null;
            return (
              <div key={provider.id}>
                <div className="model-dropdown-group">{provider.name}</div>
                {models.map((model) => {
                  const isSelected =
                    selectedModel?.providerID === provider.id &&
                    selectedModel?.modelID === model.id;
                  return (
                    <div
                      key={model.id}
                      className={`model-dropdown-item ${isSelected ? "active" : ""}`}
                      onClick={() => {
                        onSelect({ providerID: provider.id, modelID: model.id });
                        setOpen(false);
                      }}
                    >
                      <span className="model-dropdown-item-check">
                        {isSelected ? "✓" : ""}
                      </span>
                      <span>{model.name || model.id}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
