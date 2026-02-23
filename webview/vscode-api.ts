/**
 * VSCode Webview API の型定義。
 * Extension Host 側の chat-view-provider.ts で定義したプロトコルに対応する。
 */

import type { Event, Session, Message, Part, Provider, McpStatus } from "@opencode-ai/sdk";

// --- File attachment ---
export type FileAttachment = {
  filePath: string;   // ワークスペース相対パス
  fileName: string;   // 表示名
};

// --- Extension Host → Webview ---
export type ExtToWebviewMessage =
  | { type: "sessions"; sessions: Session[] }
  | { type: "messages"; sessionId: string; messages: Array<{ info: Message; parts: Part[] }> }
  | { type: "event"; event: Event }
  | { type: "activeSession"; session: Session | null }
  | { type: "providers"; providers: Provider[]; default: Record<string, string> }
  | { type: "openEditors"; files: FileAttachment[] }
  | { type: "workspaceFiles"; files: FileAttachment[] }
  | { type: "contextUsage"; usage: { inputTokens: number; contextLimit: number } }
  | { type: "toolConfig"; toolIds: string[]; toolSettings: Record<string, boolean>; mcpStatus: Record<string, McpStatus>; paths: { home: string; config: string; state: string; directory: string } };

// --- Webview → Extension Host ---
export type WebviewToExtMessage =
  | { type: "sendMessage"; sessionId: string; text: string; model?: { providerID: string; modelID: string }; files?: FileAttachment[] }
  | { type: "createSession"; title?: string }
  | { type: "listSessions" }
  | { type: "selectSession"; sessionId: string }
  | { type: "deleteSession"; sessionId: string }
  | { type: "getMessages"; sessionId: string }
  | { type: "replyPermission"; sessionId: string; permissionId: string; response: "once" | "always" | "reject" }
  | { type: "abort"; sessionId: string }
  | { type: "getProviders" }
  | { type: "getOpenEditors" }
  | { type: "searchWorkspaceFiles"; query: string }
  | { type: "compressSession"; sessionId: string; model?: { providerID: string; modelID: string } }
  | { type: "revertToMessage"; sessionId: string; messageId: string }
  | { type: "editAndResend"; sessionId: string; messageId: string; text: string; model?: { providerID: string; modelID: string }; files?: FileAttachment[] }
  | { type: "getToolConfig" }
  | { type: "toggleTool"; toolId: string; enabled: boolean }
  | { type: "toggleMcp"; name: string; connect: boolean }
  | { type: "openConfigFile"; filePath: string }
  | { type: "openTerminal" }
  | { type: "ready" };

interface VsCodeApi {
  postMessage(message: WebviewToExtMessage): void;
  getState(): WebviewPersistedState | undefined;
  setState(state: WebviewPersistedState): void;
}

export interface WebviewPersistedState {
  selectedModel?: { providerID: string; modelID: string } | null;
}

declare function acquireVsCodeApi(): VsCodeApi;

// Singleton — acquireVsCodeApi は 1 回しか呼べない
const vscode = acquireVsCodeApi();

export function postMessage(message: WebviewToExtMessage): void {
  vscode.postMessage(message);
}

export function getPersistedState(): WebviewPersistedState | undefined {
  return vscode.getState();
}

export function setPersistedState(state: WebviewPersistedState): void {
  vscode.setState(state);
}
