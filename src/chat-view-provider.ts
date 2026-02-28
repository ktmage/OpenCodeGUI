import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import type {
  Event,
  FileDiff,
  Message,
  OpenCodeConnection,
  OpenCodePath,
  Part,
  Provider,
  ProviderListResult,
  Session,
  Todo,
} from "./opencode-client";

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
  | {
      type: "providers";
      providers: Provider[];
      allProviders: ProviderListResult;
      default: Record<string, string>;
      configModel?: string;
    }
  | { type: "openEditors"; files: FileAttachment[] }
  | { type: "workspaceFiles"; files: FileAttachment[] }
  | { type: "contextUsage"; usage: { inputTokens: number; contextLimit: number } }
  | { type: "toolConfig"; paths: OpenCodePath }
  | { type: "locale"; vscodeLanguage: string }
  | { type: "modelUpdated"; model: string; default: Record<string, string> }
  | { type: "sessionDiff"; sessionId: string; diffs: FileDiff[] }
  | { type: "sessionTodos"; sessionId: string; todos: Todo[] };

// --- Webview → Extension Host ---
export type WebviewToExtMessage =
  | {
      type: "sendMessage";
      sessionId: string;
      text: string;
      model?: { providerID: string; modelID: string };
      files?: FileAttachment[];
    }
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
  | {
      type: "editAndResend";
      sessionId: string;
      messageId: string;
      text: string;
      model?: { providerID: string; modelID: string };
      files?: FileAttachment[];
    }
  | { type: "executeShell"; sessionId: string; command: string; model?: { providerID: string; modelID: string } }
  | { type: "openConfigFile"; filePath: string }
  | { type: "openTerminal" }
  | { type: "setModel"; model: string }
  | { type: "forkSession"; sessionId: string; messageId?: string }
  | { type: "getSessionDiff"; sessionId: string }
  | { type: "getSessionTodos"; sessionId: string }
  | { type: "openDiffEditor"; filePath: string; before: string; after: string }
  | { type: "ready" };

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "opencode.chatView";

  private view: vscode.WebviewView | undefined;
  // OpenCode サーバーには「現在アクティブなセッション」を保持する API がないため、
  // UI クライアント側で管理する（TUI も同様の設計）。
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
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, "dist", "webview")],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message: WebviewToExtMessage) => this.handleWebviewMessage(message));

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
        // config ファイルから model を直接読み取る（config.get API は model を正しく返さない）
        const paths = await this.connection.getPath();
        let configModel: string | undefined;
        try {
          const raw = await fs.readFile(path.join(paths.config, "opencode.json"), "utf-8");
          const configJson = JSON.parse(raw);
          configModel = configJson.model;
        } catch {
          // ファイルが存在しない場合は undefined のまま
        }
        this.postMessage({
          type: "providers",
          providers: providersData.providers,
          allProviders,
          default: providersData.default,
          configModel,
        });
        this.postMessage({ type: "toolConfig", paths });
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
        await this.connection.replyPermission(message.sessionId, message.permissionId, message.response);
        break;
      }
      case "abort": {
        await this.connection.abortSession(message.sessionId);
        break;
      }
      case "getProviders": {
        const [providersData, allProviders, paths] = await Promise.all([
          this.connection.getProviders(),
          this.connection.listAllProviders(),
          this.connection.getPath(),
        ]);
        let configModel: string | undefined;
        try {
          const raw = await fs.readFile(path.join(paths.config, "opencode.json"), "utf-8");
          configModel = JSON.parse(raw).model;
        } catch {
          // ignore
        }
        this.postMessage({
          type: "providers",
          providers: providersData.providers,
          allProviders,
          default: providersData.default,
          configModel,
        });
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
      case "executeShell": {
        await this.connection.executeShell(message.sessionId, message.command, message.model);
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
          await vscode.workspace.fs.writeFile(
            uri,
            Buffer.from('{\n  "$schema": "https://opencode.ai/config.json"\n}\n'),
          );
        }
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
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
      case "setModel": {
        // config.update API は model を永続化しないため、config ファイルを直接編集する
        const paths = await this.connection.getPath();
        const configFilePath = path.join(paths.config, "opencode.json");
        let configJson: Record<string, unknown> = {};
        try {
          const raw = await fs.readFile(configFilePath, "utf-8");
          configJson = JSON.parse(raw);
        } catch {
          // ファイルが存在しない場合は空オブジェクトから開始
        }
        configJson.model = message.model;
        await fs.mkdir(path.dirname(configFilePath), { recursive: true });
        await fs.writeFile(configFilePath, `${JSON.stringify(configJson, null, 2)}\n`);
        this.postMessage({ type: "modelUpdated", model: message.model, default: {} });
        break;
      }
      case "forkSession": {
        // Fork で新しいセッションを作成し、アクティブセッションを切り替える
        const forkedSession = await this.connection.forkSession(message.sessionId, message.messageId);
        this.activeSession = forkedSession;
        this.postMessage({ type: "activeSession", session: forkedSession });
        const forkedSessions = await this.connection.listSessions();
        this.postMessage({ type: "sessions", sessions: forkedSessions });
        break;
      }
      case "getSessionDiff": {
        const diffs = await this.connection.getSessionDiff(message.sessionId);
        this.postMessage({ type: "sessionDiff", sessionId: message.sessionId, diffs });
        break;
      }
      case "getSessionTodos": {
        const todos = await this.connection.getSessionTodos(message.sessionId);
        this.postMessage({ type: "sessionTodos", sessionId: message.sessionId, todos });
        break;
      }
      case "openDiffEditor": {
        // 仮想ドキュメントを使って VS Code のネイティブ diff エディタを開く
        const beforeUri = vscode.Uri.parse(
          `opencode-diff-before:${message.filePath}?${encodeURIComponent(message.before)}`,
        );
        const afterUri = vscode.Uri.parse(
          `opencode-diff-after:${message.filePath}?${encodeURIComponent(message.after)}`,
        );
        const fileName = path.basename(message.filePath);
        await vscode.commands.executeCommand("vscode.diff", beforeUri, afterUri, `${fileName} (Changes)`);
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
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(distUri, "assets", "index.js"));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(distUri, "assets", "index.css"));

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
