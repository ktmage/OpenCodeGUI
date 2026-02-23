import * as vscode from "vscode";
import { OpenCodeConnection, type Event, type Session, type Message, type Part, type Provider, type McpStatus, type Config, type OpenCodePath, type ProviderListResult } from "./opencode-client";
import * as path from "path";

// --- File attachment ---
type FileAttachment = {
  filePath: string;
  fileName: string;
};

// --- Extension Host → Webview ---
export type ExtToWebviewMessage =
  | { type: "sessions"; sessions: Session[] }
  | { type: "messages"; sessionId: string; messages: Array<{ info: Message; parts: Part[] }> }
  | { type: "event"; event: Event }
  | { type: "activeSession"; session: Session | null }
  | { type: "providers"; providers: Provider[]; allProviders: ProviderListResult; default: Record<string, string> }
  | { type: "openEditors"; files: FileAttachment[] }
  | { type: "workspaceFiles"; files: FileAttachment[] }
  | { type: "contextUsage"; usage: { inputTokens: number; contextLimit: number } }
  | { type: "toolConfig"; toolIds: string[]; toolSettings: Record<string, boolean>; mcpStatus: Record<string, McpStatus>; paths: OpenCodePath }
  | { type: "locale"; vscodeLanguage: string };

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
  | { type: "openConfigFile"; filePath: string }
  | { type: "restartServer" }
  | { type: "openTerminal" }
  | { type: "ready" };

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "opencode.chatView";

  private view: vscode.WebviewView | undefined;
  private activeSession: Session | null = null;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly connection: OpenCodeConnection,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void {
    this.view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, "dist", "webview"),
      ],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(
      (message: WebviewToExtMessage) => this.handleWebviewMessage(message),
    );

    // SSE イベントを Webview に転送する
    this.connection.onEvent((event) => {
      this.postMessage({ type: "event", event });
    });
  }

  private async handleWebviewMessage(message: WebviewToExtMessage): Promise<void> {
    try {
      await this.handleWebviewMessageInner(message);
    } catch (err) {
      console.error(`[OpenCode] Error handling message '${message.type}':`, err);
    }
  }

  private async handleWebviewMessageInner(message: WebviewToExtMessage): Promise<void> {
    switch (message.type) {
      case "ready": {
        // VS Code の言語設定を送信
        this.postMessage({ type: "locale", vscodeLanguage: vscode.env.language });
        // Webview の初期化完了時にセッション一覧、現在のセッション、プロバイダー一覧を送信する
        const sessions = await this.connection.listSessions();
        this.postMessage({ type: "sessions", sessions });
        this.postMessage({ type: "activeSession", session: this.activeSession });
        const [providersData, allProviders] = await Promise.all([
          this.connection.getProviders(),
          this.connection.listAllProviders(),
        ]);
        this.postMessage({ type: "providers", providers: providersData.providers, allProviders, default: providersData.default });
        break;
      }
      case "sendMessage": {
        await this.connection.sendMessage(message.sessionId, message.text, message.model, message.files);
        break;
      }
      case "createSession": {
        const session = await this.connection.createSession(message.title);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const sessions = await this.connection.listSessions();
        this.postMessage({ type: "sessions", sessions });
        break;
      }
      case "listSessions": {
        const sessions = await this.connection.listSessions();
        this.postMessage({ type: "sessions", sessions });
        break;
      }
      case "selectSession": {
        const session = await this.connection.getSession(message.sessionId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const messages = await this.connection.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages });
        break;
      }
      case "deleteSession": {
        await this.connection.deleteSession(message.sessionId);
        if (this.activeSession?.id === message.sessionId) {
          this.activeSession = null;
          this.postMessage({ type: "activeSession", session: null });
        }
        const sessions = await this.connection.listSessions();
        this.postMessage({ type: "sessions", sessions });
        break;
      }
      case "getMessages": {
        const messages = await this.connection.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages });
        break;
      }
      case "replyPermission": {
        await this.connection.replyPermission(
          message.sessionId,
          message.permissionId,
          message.response,
        );
        break;
      }
      case "abort": {
        await this.connection.abortSession(message.sessionId);
        break;
      }
      case "getProviders": {
        const [providersData, allProviders] = await Promise.all([
          this.connection.getProviders(),
          this.connection.listAllProviders(),
        ]);
        this.postMessage({ type: "providers", providers: providersData.providers, allProviders, default: providersData.default });
        break;
      }
      case "getOpenEditors": {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri;
        const files: FileAttachment[] = vscode.window.tabGroups.all
          .flatMap((group) => group.tabs)
          .filter((tab) => tab.input instanceof vscode.TabInputText)
          .map((tab) => {
            const uri = (tab.input as vscode.TabInputText).uri;
            const relativePath = workspaceFolder
              ? path.relative(workspaceFolder.fsPath, uri.fsPath)
              : path.basename(uri.fsPath);
            return { filePath: relativePath, fileName: path.basename(uri.fsPath) };
          })
          // 重複除去
          .filter((f, i, arr) => arr.findIndex((a) => a.filePath === f.filePath) === i);
        this.postMessage({ type: "openEditors", files });
        break;
      }
      case "searchWorkspaceFiles": {
        const pattern = message.query ? `**/*${message.query}*` : "**/*";
        const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 20);
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri;
        const files: FileAttachment[] = uris.map((uri) => {
          const relativePath = workspaceFolder
            ? path.relative(workspaceFolder.fsPath, uri.fsPath)
            : path.basename(uri.fsPath);
          return { filePath: relativePath, fileName: path.basename(uri.fsPath) };
        });
        this.postMessage({ type: "workspaceFiles", files });
        break;
      }
      case "compressSession": {
        await this.connection.summarizeSession(message.sessionId, message.model);
        break;
      }
      case "revertToMessage": {
        const session = await this.connection.revertSession(message.sessionId, message.messageId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const messages = await this.connection.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages });
        break;
      }
      case "editAndResend": {
        // 1. 指定メッセージまで巻き戻す（そのメッセージ以降を削除）
        const session = await this.connection.revertSession(message.sessionId, message.messageId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const msgs = await this.connection.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages: msgs });
        // 2. 編集後のテキストを送信
        await this.connection.sendMessage(message.sessionId, message.text, message.model, message.files);
        break;
      }
      case "getToolConfig": {
        const [toolIds, config, mcpStatus, paths] = await Promise.all([
          this.connection.getToolIds(),
          this.connection.getConfig(),
          this.connection.getMcpStatus(),
          this.connection.getPath(),
        ]);
        this.postMessage({
          type: "toolConfig",
          toolIds,
          toolSettings: config.tools ?? {},
          mcpStatus,
          paths,
        });
        break;
      }
      case "openConfigFile": {
        const filePath = message.filePath;
        const uri = vscode.Uri.file(filePath);
        try {
          await vscode.workspace.fs.stat(uri);
        } catch {
          // ファイルが存在しない場合は初期内容で作成する
          const dir = vscode.Uri.file(filePath.substring(0, filePath.lastIndexOf("/")));
          await vscode.workspace.fs.createDirectory(dir);
          await vscode.workspace.fs.writeFile(uri, Buffer.from('{\n  "$schema": "https://opencode.ai/config.json"\n}\n'));
        }
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
        break;
      }
      case "restartServer": {
        this.connection.disconnect();
        await this.connection.connect();
        // 再接続後にイベントを再購読する
        this.connection.onEvent((event) => {
          this.postMessage({ type: "event", event });
        });
        // 再接続後の初期データを送信する
        const rsSessions = await this.connection.listSessions();
        this.postMessage({ type: "sessions", sessions: rsSessions });
        if (this.activeSession) {
          try {
            const rsSession = await this.connection.getSession(this.activeSession.id);
            this.activeSession = rsSession;
            this.postMessage({ type: "activeSession", session: rsSession });
            const rsMessages = await this.connection.getMessages(rsSession.id);
            this.postMessage({ type: "messages", sessionId: rsSession.id, messages: rsMessages });
          } catch {
            this.activeSession = null;
            this.postMessage({ type: "activeSession", session: null });
          }
        }
        const [rsProvidersData, rsAllProviders] = await Promise.all([
          this.connection.getProviders(),
          this.connection.listAllProviders(),
        ]);
        this.postMessage({ type: "providers", providers: rsProvidersData.providers, allProviders: rsAllProviders, default: rsProvidersData.default });
        const [rsToolIds, rsConfig, rsMcpStatus, rsPaths] = await Promise.all([
          this.connection.getToolIds(),
          this.connection.getConfig(),
          this.connection.getMcpStatus(),
          this.connection.getPaths(),
        ]);
        this.postMessage({
          type: "toolConfig",
          toolIds: rsToolIds,
          toolSettings: rsConfig.tools ?? {},
          mcpStatus: rsMcpStatus,
          paths: rsPaths,
        });
        break;
      }
      case "openTerminal": {
        const serverUrl = this.connection.serverUrl;
        if (!serverUrl) break;
        const args = ["attach", serverUrl];
        if (this.activeSession) {
          args.push("--session", this.activeSession.id);
        }
        const terminal = vscode.window.createTerminal({
          name: "OpenCode",
          cwd: this.connection.workspaceFolder,
        });
        terminal.show();
        terminal.sendText(`opencode ${args.map((a) => JSON.stringify(a)).join(" ")}`);
        break;
      }
    }
  }

  private postMessage(message: ExtToWebviewMessage): void {
    this.view?.webview.postMessage(message);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const distUri = vscode.Uri.joinPath(this.extensionUri, "dist", "webview");

    // Vite がビルドした JS/CSS アセットを参照する
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(distUri, "assets", "index.js"),
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(distUri, "assets", "index.css"),
    );

    const nonce = getNonce();

    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';" />
  <link rel="stylesheet" href="${styleUri}" nonce="${nonce}" />
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}
