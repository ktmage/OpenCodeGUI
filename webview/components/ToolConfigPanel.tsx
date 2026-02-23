import { useEffect, useRef } from "react";
import type { McpStatus } from "@opencode-ai/sdk";

type Props = {
  toolIds: string[];
  toolSettings: Record<string, boolean>;
  mcpStatus: Record<string, McpStatus>;
  paths: { home: string; config: string; state: string; directory: string } | null;
  onToggleTool: (toolId: string, enabled: boolean) => void;
  onToggleMcp: (name: string, connect: boolean) => void;
  onOpenConfigFile: (filePath: string) => void;
  onClose: () => void;
};

function mcpStatusLabel(status: McpStatus): string {
  switch (status.status) {
    case "connected": return "Connected";
    case "disabled": return "Disabled";
    case "failed": return "Error";
    case "needs_auth": return "Needs Auth";
    case "needs_client_registration": return "Needs Registration";
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

export function ToolConfigPanel({ toolIds, toolSettings, mcpStatus, paths, onToggleTool, onToggleMcp, onOpenConfigFile, onClose }: Props) {
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
  for (const id of toolIds) {
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
        <span className="tool-config-title">Tools & MCP Servers</span>
        <button className="tool-config-close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707z" />
          </svg>
        </button>
      </div>

      <div className="tool-config-body">
        {/* MCP Servers */}
        {mcpNames.length > 0 && (
          <div className="tool-config-section">
            <div className="tool-config-section-title">MCP Servers</div>
            {mcpNames.map((name) => {
              const status = mcpStatus[name];
              const isConnected = status.status === "connected";
              const tools = mcpToolsByServer.get(name) ?? [];
              return (
                <div key={name} className="tool-config-mcp-item">
                  <label className="tool-config-toggle">
                    <input
                      type="checkbox"
                      checked={isConnected}
                      onChange={() => onToggleMcp(name, !isConnected)}
                    />
                    <span className="tool-config-mcp-name">{name}</span>
                    <span className={`tool-config-mcp-status ${mcpStatusClass(status)}`}>
                      {mcpStatusLabel(status)}
                    </span>
                  </label>
                  {isConnected && tools.length > 0 && (
                    <div className="tool-config-mcp-tools">
                      {tools.map((id) => {
                        const enabled = toolSettings[id] !== false;
                        return (
                          <label key={id} className="tool-config-toggle tool-config-tool-item">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={() => onToggleTool(id, !enabled)}
                            />
                            <span className="tool-config-tool-name">{id}</span>
                          </label>
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
            <div className="tool-config-section-title">Tools</div>
            {builtinTools.map((id) => {
              const enabled = toolSettings[id] !== false;
              return (
                <label key={id} className="tool-config-toggle tool-config-tool-item">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => onToggleTool(id, !enabled)}
                  />
                  <span className="tool-config-tool-name">{id}</span>
                </label>
              );
            })}
          </div>
        )}

        {toolIds.length === 0 && mcpNames.length === 0 && (
          <div className="tool-config-empty">No tools or MCP servers available</div>
        )}
      </div>

      {/* 設定ファイルへのリンク */}
      {paths && (
        <div className="tool-config-footer">
          <button
            className="tool-config-link"
            onClick={() => onOpenConfigFile(`${paths.directory}/.opencode/config.json`)}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.85 4.44l-3.28-3.3-.71.7 2.57 2.59H1.5v1h10.93l-2.57 2.58.71.7 3.28-3.28.36-.49-.36-.5zM2.15 11.56l3.28 3.3.71-.7-2.57-2.59H14.5v-1H3.57l2.57-2.58-.71-.7-3.28 3.28-.36.49.36.5z" />
            </svg>
            Project Config
          </button>
          <button
            className="tool-config-link"
            onClick={() => onOpenConfigFile(`${paths.config}/config.json`)}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13.85 4.44l-3.28-3.3-.71.7 2.57 2.59H1.5v1h10.93l-2.57 2.58.71.7 3.28-3.28.36-.49-.36-.5zM2.15 11.56l3.28 3.3.71-.7-2.57-2.59H14.5v-1H3.57l2.57-2.58-.71-.7-3.28 3.28-.36.49.36.5z" />
            </svg>
            Global Config
          </button>
        </div>
      )}
    </div>
  );
}
