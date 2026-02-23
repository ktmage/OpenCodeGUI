import { useEffect, useRef } from "react";
import type { McpStatus } from "@opencode-ai/sdk";
import { useLocale } from "../locales";
import type { LocaleSetting } from "../locales";

type Props = {
  toolIds: string[];
  toolSettings: Record<string, boolean>;
  mcpStatus: Record<string, McpStatus>;
  paths: { home: string; config: string; state: string; directory: string } | null;
  onOpenConfigFile: (filePath: string) => void;
  onRestartServer: () => void;
  onClose: () => void;
  localeSetting: LocaleSetting;
  onLocaleSettingChange: (setting: LocaleSetting) => void;
};

function mcpStatusLabel(status: McpStatus, t: ReturnType<typeof useLocale>): string {
  switch (status.status) {
    case "connected": return t["config.connected"];
    case "disabled": return t["config.disabled"];
    case "failed": return t["config.error"];
    case "needs_auth": return t["config.needsAuth"];
    case "needs_client_registration": return t["config.needsRegistration"];
  }
}

function mcpStatusClass(status: McpStatus): string {
  switch (status.status) {
    case "connected": return "status-connected";
    case "disabled": return "status-disabled";
    case "failed": return "status-error";
    case "needs_auth":
    case "needs_client_registration": return "status-warning";
  }
}

export function ToolConfigPanel({ toolIds, toolSettings, mcpStatus, paths, onOpenConfigFile, onRestartServer, onClose, localeSetting, onLocaleSettingChange }: Props) {
  const t = useLocale();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // MCP サーバー名を接頭辞として持つツールをグループ化するため名前一覧を取得
  const mcpNames = Object.keys(mcpStatus);

  // ツールを MCP ツールとビルトインで分類
  const mcpToolsByServer = new Map<string, string[]>();
  const builtinTools: string[] = [];
  // toolIds（有効なツール）と toolSettings で明示的に無効化されたツールを統合
  const allToolIds = new Set(toolIds);
  for (const id of Object.keys(toolSettings)) {
    allToolIds.add(id);
  }
  for (const id of allToolIds) {
    let matched = false;
    for (const name of mcpNames) {
      if (id.startsWith(`${name}_`) || id.startsWith(`${name}/`)) {
        const list = mcpToolsByServer.get(name) ?? [];
        list.push(id);
        mcpToolsByServer.set(name, list);
        matched = true;
        break;
      }
    }
    if (!matched) {
      builtinTools.push(id);
    }
  }

  return (
    <div className="tool-config-panel" ref={panelRef}>
      <div className="tool-config-header">
        <span className="tool-config-title">{t["config.title"]}</span>
        <button className="tool-config-close" onClick={onClose} title={t["config.close"]}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707z" />
          </svg>
        </button>
      </div>

      <div className="tool-config-body">
        {/* MCP Servers */}
        {mcpNames.length > 0 && (
          <div className="tool-config-section">
            <div className="tool-config-section-title">{t["config.mcpServers"]}</div>
            {mcpNames.map((name) => {
              const status = mcpStatus[name];
              const isConnected = status.status === "connected";
              const tools = mcpToolsByServer.get(name) ?? [];
              return (
                <div key={name} className="tool-config-mcp-item">
                  <div className="tool-config-status-row">
                    <span className="tool-config-mcp-name">{name}</span>
                    <span className={`tool-config-mcp-status ${mcpStatusClass(status)}`}>
                      {mcpStatusLabel(status, t)}
                    </span>
                  </div>
                  {isConnected && tools.length > 0 && (
                    <div className="tool-config-mcp-tools">
                      {tools.map((id) => {
                        const enabled = toolSettings[id] !== false;
                        return (
                          <div key={id} className="tool-config-status-row tool-config-tool-item">
                            <span className="tool-config-tool-name">{id}</span>
                            <span className={`tool-config-tool-badge ${enabled ? "badge-enabled" : "badge-disabled"}`}>
                              {enabled ? t["config.enabled"] : t["config.disabled"]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Built-in Tools */}
        {builtinTools.length > 0 && (
          <div className="tool-config-section">
            <div className="tool-config-section-title">{t["config.tools"]}</div>
            {builtinTools.map((id) => {
              const enabled = toolSettings[id] !== false;
              return (
                <div key={id} className="tool-config-status-row tool-config-tool-item">
                  <span className="tool-config-tool-name">{id}</span>
                  <span className={`tool-config-tool-badge ${enabled ? "badge-enabled" : "badge-disabled"}`}>
                    {enabled ? t["config.enabled"] : t["config.disabled"]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {toolIds.length === 0 && mcpNames.length === 0 && (
          <div className="tool-config-empty">{t["config.noToolsOrMcp"]}</div>
        )}

        {/* Language Setting */}
        <div className="tool-config-section">
          <div className="tool-config-section-title">{t["config.language"]}</div>
          <div className="tool-config-locale-options">
            {(["auto", "en", "ja"] as const).map((opt) => {
              const label = opt === "auto" ? t["config.langAuto"] : opt === "en" ? t["config.langEn"] : t["config.langJa"];
              return (
                <label key={opt} className="tool-config-toggle tool-config-tool-item">
                  <input
                    type="radio"
                    name="locale"
                    checked={localeSetting === opt}
                    onChange={() => onLocaleSettingChange(opt)}
                  />
                  <span className="tool-config-tool-name">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 注意書きとサーバー再起動ボタン */}
      <div className="tool-config-notice">
        <span className="tool-config-notice-text">{t["config.restartNotice"]}</span>
        <button className="tool-config-restart-button" onClick={onRestartServer}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.451 5.609l-.579-.101.248-.521C12.225 3.1 10.252 2 8.07 2A6.026 6.026 0 0 0 2 7.955a6.1 6.1 0 0 0 6.07 6.044 6.026 6.026 0 0 0 5.83-4.515l.073-.273.962.26-.073.274A7.026 7.026 0 0 1 8.07 15 7.1 7.1 0 0 1 1 7.955 7.026 7.026 0 0 1 8.07 1c2.478 0 4.737 1.258 5.886 3.21l.201.348.293-.052V1h1v5.609h-1z" />
          </svg>
          {t["config.restartServer"]}
        </button>
      </div>

      {/* 設定ファイルへのリンク */}
      {paths && (
        <div className="tool-config-footer">
          <button
            className="tool-config-link"
            onClick={() => onOpenConfigFile(`${paths.directory}/opencode.json`)}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.71 4.29l-3-3A1 1 0 0 0 10 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-.29-.71zM12 14H4V2h5v3a1 1 0 0 0 1 1h3v8z" />
            </svg>
            {t["config.projectConfig"]}
          </button>
          <button
            className="tool-config-link"
            onClick={() => onOpenConfigFile(`${paths.config}/opencode.json`)}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.71 4.29l-3-3A1 1 0 0 0 10 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-.29-.71zM12 14H4V2h5v3a1 1 0 0 0 1 1h3v8z" />
            </svg>
            {t["config.globalConfig"]}
          </button>
        </div>
      )}
    </div>
  );
}
