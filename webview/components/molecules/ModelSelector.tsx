import type { Provider } from "@opencode-ai/sdk";
import { useMemo, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useLocale } from "../../locales";
import type { AllProvidersData, ModelInfo, ProviderInfo } from "../../vscode-api";
import { ChevronRightIcon, EyeIcon, EyeOffIcon } from "../atoms/icons";
import { LinkButton } from "../atoms/LinkButton";
import styles from "./ModelSelector.module.css";

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

const badgeClass: Record<string, string> = {
  beta: styles.beta,
  alpha: styles.alpha,
  deprecated: styles.deprecated,
};

export function ModelSelector({ providers, allProvidersData, selectedModel, onSelect }: Props) {
  const t = useLocale();
  const [open, setOpen] = useState(false);
  const [collapsedProviders, setCollapsedProviders] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

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

  const hasDisconnected = useMemo(() => allDisplayProviders.some((p) => !p.connected), [allDisplayProviders]);

  const selectedModelName = useMemo(() => {
    if (!selectedModel) return t["model.selectModel"];
    for (const p of allDisplayProviders) {
      const model = p.models.find((m) => m.id === selectedModel.modelID && p.id === selectedModel.providerID);
      if (model) return model.name || selectedModel.modelID;
    }
    return selectedModel.modelID;
  }, [selectedModel, allDisplayProviders, t["model.selectModel"]]);

  const toggleProvider = (id: string) => {
    setCollapsedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={styles.root} ref={containerRef}>
      <button
        type="button"
        className={styles.button}
        onClick={() => setOpen((s) => !s)}
        title={t["model.selectModel"]}
      >
        <span className={styles.label}>{selectedModelName}</span>
        <span className={`${styles.chevron} ${open ? styles.expanded : ""}`}>
          <ChevronRightIcon />
        </span>
      </button>
      {open && (
        <div className={styles.panel}>
          <div className={styles.panelBody}>
            {displayProviders.map((provider) => {
              if (provider.models.length === 0) return null;
              const isCollapsed = collapsedProviders.has(provider.id);
              return (
                <div key={provider.id} className={styles.section}>
                  <div
                    className={`${styles.sectionTitle} ${!provider.connected ? styles.disconnected : ""}`}
                    onClick={() => toggleProvider(provider.id)}
                  >
                    <span className={`${styles.chevron} ${isCollapsed ? "" : styles.expanded}`}>
                      <ChevronRightIcon />
                    </span>
                    <span className={styles.sectionName}>{provider.name}</span>
                    {!provider.connected && (
                      <span className={styles.sectionBadge}>{t["model.notConnected"]}</span>
                    )}
                  </div>
                  {!isCollapsed &&
                    provider.models.map((model) => {
                      const isSelected =
                        selectedModel?.providerID === provider.id && selectedModel?.modelID === model.id;
                      const disabled = !provider.connected;
                      const badge = statusBadge(model.status);
                      return (
                        <div
                          key={model.id}
                          className={[styles.item, isSelected && styles.active, disabled && styles.disabled].filter(Boolean).join(" ")}
                          onClick={() => {
                            if (disabled) return;
                            onSelect({ providerID: provider.id, modelID: model.id });
                            setOpen(false);
                          }}
                        >
                          <span className={styles.itemCheck}>{isSelected ? "✓" : ""}</span>
                          <span className={styles.itemName}>
                            {model.name || model.id}
                            {badge && <span className={`${styles.itemBadge} ${badgeClass[badge] ?? ""}`}>{badge}</span>}
                          </span>
                          {model.limit && (
                            <span className={styles.itemMeta}>
                              <span className={styles.itemContext}>{formatContextK(model.limit.context)}</span>
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
            <div className={styles.footer}>
              <LinkButton
                onClick={() => setShowAll((s) => !s)}
                title={showAll ? t["model.hideDisconnected"] : t["model.showAll"]}
              >
                {showAll ? <EyeIcon /> : <EyeOffIcon />}
                <span>{showAll ? t["model.connectedOnly"] : t["model.showAll"]}</span>
              </LinkButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
