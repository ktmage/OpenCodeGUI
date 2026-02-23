import {
  createOpencodeClient,
  createOpencodeServer,
  type OpencodeClient,
  type Event,
  type Session,
  type Message,
  type Part,
} from "@opencode-ai/sdk";
import * as vscode from "vscode";

export type { Event, Session, Message, Part };

type EventListener = (event: Event) => void;

/**
 * OpenCode サーバーへの接続を一元管理するモジュール。
 * Webview や他のコンポーネントから直接 SDK を触らず、このクラスを経由する。
 */
export class OpenCodeConnection {
  private client: OpencodeClient | undefined;
  private server: { url: string; close(): void } | undefined;
  private sseAbortController: AbortController | undefined;
  private listeners: Set<EventListener> = new Set();

  async connect(): Promise<void> {
    const server = await createOpencodeServer();
    this.server = server;
    this.client = createOpencodeClient({
      baseUrl: server.url,
    });
    this.subscribeToEvents();
  }

  private async subscribeToEvents(): Promise<void> {
    const client = this.requireClient();
    this.sseAbortController = new AbortController();
    const result = await client.event.subscribe({
      signal: this.sseAbortController.signal,
    });
    // SSE ストリームからイベントを読み取り、リスナーに配信する
    (async () => {
      try {
        for await (const event of result.stream) {
          for (const listener of this.listeners) {
            listener(event as Event);
          }
        }
      } catch (error) {
        // AbortError はストリームの正常終了
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        throw error;
      }
    })();
  }

  onEvent(listener: EventListener): vscode.Disposable {
    this.listeners.add(listener);
    return new vscode.Disposable(() => {
      this.listeners.delete(listener);
    });
  }

  // --- Session API ---

  async listSessions(): Promise<Session[]> {
    const client = this.requireClient();
    const response = await client.session.list();
    return response.data!;
  }

  async createSession(title?: string): Promise<Session> {
    const client = this.requireClient();
    const response = await client.session.create({
      body: { title },
    });
    return response.data!;
  }

  async getSession(id: string): Promise<Session> {
    const client = this.requireClient();
    const response = await client.session.get({
      path: { id },
    });
    return response.data!;
  }

  async deleteSession(id: string): Promise<void> {
    const client = this.requireClient();
    await client.session.delete({
      path: { id },
    });
  }

  // --- Message API ---

  async getMessages(
    sessionId: string,
  ): Promise<Array<{ info: Message; parts: Part[] }>> {
    const client = this.requireClient();
    const response = await client.session.messages({
      path: { id: sessionId },
    });
    return response.data!;
  }

  /**
   * 非同期でメッセージを送信する。
   * 応答は SSE イベントストリーム経由で配信される。
   */
  async sendMessage(sessionId: string, text: string): Promise<void> {
    const client = this.requireClient();
    await client.session.promptAsync({
      path: { id: sessionId },
      body: {
        parts: [{ type: "text", text }],
      },
    });
  }

  async abortSession(sessionId: string): Promise<void> {
    const client = this.requireClient();
    await client.session.abort({
      path: { id: sessionId },
    });
  }

  // --- Permission API ---

  async replyPermission(
    sessionId: string,
    permissionId: string,
    response: "once" | "always" | "reject",
  ): Promise<void> {
    const client = this.requireClient();
    await client.postSessionIdPermissionsPermissionId({
      path: { id: sessionId, permissionID: permissionId },
      body: { response },
    });
  }

  // --- Lifecycle ---

  disconnect(): void {
    this.sseAbortController?.abort();
    this.sseAbortController = undefined;
    this.server?.close();
    this.server = undefined;
    this.client = undefined;
    this.listeners.clear();
  }

  private requireClient(): OpencodeClient {
    if (!this.client) {
      throw new Error(
        "OpenCode client is not connected. Call connect() first.",
      );
    }
    return this.client;
  }
}
