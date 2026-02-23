/**
 * VSCode Webview API の型定義。
 * Extension Host 側の chat-view-provider.ts で定義したプロトコルに対応する。
 */

import type { Event, Session, Message, Part } from "@opencode-ai/sdk";

// --- Extension Host → Webview ---
export type ExtToWebviewMessage =
  | { type: "sessions"; sessions: Session[] }
  | { type: "messages"; sessionId: string; messages: Array<{ info: Message; parts: Part[] }> }
  | { type: "event"; event: Event }
  | { type: "activeSession"; session: Session | null };

// --- Webview → Extension Host ---
export type WebviewToExtMessage =
  | { type: "sendMessage"; sessionId: string; text: string }
  | { type: "createSession"; title?: string }
  | { type: "listSessions" }
  | { type: "selectSession"; sessionId: string }
  | { type: "deleteSession"; sessionId: string }
  | { type: "getMessages"; sessionId: string }
  | { type: "replyPermission"; sessionId: string; permissionId: string; response: "once" | "always" | "reject" }
  | { type: "abort"; sessionId: string }
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
