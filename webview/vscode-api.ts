/**
 * VSCode Webview API の型定義。
 * Extension Host 側の chat-view-provider.ts で定義したプロトコルに対応する。
 */

import type { Event, Session, Message, Part, Provider } from "@opencode-ai/sdk";

// --- Extension Host → Webview ---
export type ExtToWebviewMessage =
  | { type: "sessions"; sessions: Session[] }
  | { type: "messages"; sessionId: string; messages: Array<{ info: Message; parts: Part[] }> }
  | { type: "event"; event: Event }
  | { type: "activeSession"; session: Session | null }
  | { type: "providers"; providers: Provider[]; default: Record<string, string> };

// --- Webview → Extension Host ---
export type WebviewToExtMessage =
  | { type: "sendMessage"; sessionId: string; text: string; model?: { providerID: string; modelID: string } }
  | { type: "createSession"; title?: string }
  | { type: "listSessions" }
  | { type: "selectSession"; sessionId: string }
  | { type: "deleteSession"; sessionId: string }
  | { type: "getMessages"; sessionId: string }
  | { type: "replyPermission"; sessionId: string; permissionId: string; response: "once" | "always" | "reject" }
  | { type: "abort"; sessionId: string }
  | { type: "getProviders" }
  | { type: "ready" };

interface VsCodeApi {
  postMessage(message: WebviewToExtMessage): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

// Singleton — acquireVsCodeApi は 1 回しか呼べない
const vscode = acquireVsCodeApi();

export function postMessage(message: WebviewToExtMessage): void {
  vscode.postMessage(message);
}
