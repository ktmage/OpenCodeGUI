import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { ChatSession, HostToUIMessage, IAgent, IPlatformServices, UIToHostMessage } from "@opencodegui/core";
import * as vscode from "vscode";

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "opencode.chatView";

  private view: vscode.WebviewView | undefined;
  // OpenCode サーバーには「現在アクティブなセッション」を保持する API がないため、
  // UI クライアント側で管理する（TUI も同様の設計）。
  private activeSession: ChatSession | null = null;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly agent: IAgent,
    private readonly platformServices: IPlatformServices,
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

    webviewView.webview.onDidReceiveMessage((message: UIToHostMessage) => this.handleWebviewMessage(message));

    // SSE イベントを Webview に転送する
    this.agent.onEvent((event) => {
      this.postMessage({ type: "event", event });
    });

    // アクティブエディタが変わるたびに Webview に通知する
    // (プッシュ型通知はメッセージルーターの責務として残す)
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      this.postMessage({ type: "activeEditor", file: this.getActiveEditorFile(editor) });
    });
  }

  private async handleWebviewMessage(message: UIToHostMessage): Promise<void> {
    try {
      await this.handleWebviewMessageInner(message);
    } catch (err) {
      console.error(`[OpenCode] Error handling message '${message.type}':`, err);
    }
  }

  private async handleWebviewMessageInner(message: UIToHostMessage): Promise<void> {
    switch (message.type) {
      case "ready": {
        // Webview の初期化完了時に init メッセージを送信する（locale + toolConfig を統合）
        const paths = await this.agent.getPath();
        this.postMessage({
          type: "init",
          capabilities: this.agent.getCapabilities(),
          locale: vscode.env.language,
          paths,
        });
        // セッション一覧、現在のセッション、プロバイダー一覧を送信する
        const sessions = await this.agent.listSessions();
        this.postMessage({ type: "sessions", sessions });
        this.postMessage({ type: "activeSession", session: this.activeSession });
        const [providersData, allProviders] = await Promise.all([
          this.agent.getProviders(),
          this.agent.listAllProviders(),
        ]);
        // config ファイルから model を直接読み取る（config.get API は model を正しく返さない）
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
        // 初期アクティブエディタを送信する
        this.postMessage({ type: "activeEditor", file: this.getActiveEditorFile(vscode.window.activeTextEditor) });
        break;
      }
      case "sendMessage": {
        await this.agent.sendMessage(message.sessionId, message.text, {
          model: message.model,
          files: message.files,
          agent: message.agent,
        });
        break;
      }
      case "createSession": {
        const session = await this.agent.createSession(message.title);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const sessions = await this.agent.listSessions();
        this.postMessage({ type: "sessions", sessions });
        break;
      }
      case "listSessions": {
        const sessions = await this.agent.listSessions();
        this.postMessage({ type: "sessions", sessions });
        break;
      }
      case "selectSession": {
        const session = await this.agent.getSession(message.sessionId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const messages = await this.agent.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages });
        break;
      }
      case "deleteSession": {
        await this.agent.deleteSession(message.sessionId);
        if (this.activeSession?.id === message.sessionId) {
          this.activeSession = null;
          this.postMessage({ type: "activeSession", session: null });
        }
        const sessions = await this.agent.listSessions();
        this.postMessage({ type: "sessions", sessions });
        break;
      }
      case "getMessages": {
        const messages = await this.agent.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages });
        break;
      }
      case "replyPermission": {
        await this.agent.replyPermission(message.sessionId, message.permissionId, message.response);
        break;
      }
      case "replyQuestion": {
        await this.agent.replyQuestion(message.requestId, message.answers);
        break;
      }
      case "rejectQuestion": {
        await this.agent.rejectQuestion(message.requestId);
        break;
      }
      case "abort": {
        await this.agent.abortSession(message.sessionId);
        break;
      }
      case "getProviders": {
        const [providersData, allProviders, paths] = await Promise.all([
          this.agent.getProviders(),
          this.agent.listAllProviders(),
          this.agent.getPath(),
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
      // --- Platform operations delegated to IPlatformServices ---
      case "getOpenEditors": {
        const files = await this.platformServices.getOpenEditors();
        this.postMessage({ type: "openEditors", files });
        break;
      }
      case "searchWorkspaceFiles": {
        const files = await this.platformServices.searchWorkspaceFiles(message.query);
        this.postMessage({ type: "workspaceFiles", files });
        break;
      }
      case "compressSession": {
        await this.agent.summarizeSession(message.sessionId, message.model);
        break;
      }
      case "revertToMessage": {
        const session = await this.agent.revertSession(message.sessionId, message.messageId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const messages = await this.agent.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages });
        break;
      }
      case "editAndResend": {
        // 1. 指定メッセージまで巻き戻す（そのメッセージ以降を削除）
        const session = await this.agent.revertSession(message.sessionId, message.messageId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const msgs = await this.agent.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages: msgs });
        // 2. 編集後のテキストを送信
        await this.agent.sendMessage(message.sessionId, message.text, {
          model: message.model,
          files: message.files,
        });
        break;
      }
      case "executeShell": {
        await this.agent.executeShell(message.sessionId, message.command, message.model);
        break;
      }
      case "openConfigFile": {
        await this.platformServices.openConfigFile(message.filePath);
        break;
      }
      case "openTerminal": {
        const serverUrl = this.agent.getServerUrl();
        if (!serverUrl) break;
        await this.platformServices.openTerminal(serverUrl, this.activeSession?.id);
        break;
      }
      case "setModel": {
        // Delegate model persistence to the agent (OpenCode-specific config file workaround)
        await this.agent.setModel!(message.model);
        this.postMessage({ type: "modelUpdated", model: message.model, default: {} });
        break;
      }
      case "forkSession": {
        // Fork で新しいセッションを作成し、アクティブセッションを切り替える
        const forkedSession = await this.agent.forkSession(message.sessionId, message.messageId);
        this.activeSession = forkedSession;
        this.postMessage({ type: "activeSession", session: forkedSession });
        const forkedSessions = await this.agent.listSessions();
        this.postMessage({ type: "sessions", sessions: forkedSessions });
        break;
      }
      case "getSessionDiff": {
        const diffs = await this.agent.getSessionDiff(message.sessionId);
        this.postMessage({ type: "sessionDiff", sessionId: message.sessionId, diffs });
        break;
      }
      case "getSessionTodos": {
        const todos = await this.agent.getSessionTodos(message.sessionId);
        this.postMessage({ type: "sessionTodos", sessionId: message.sessionId, todos });
        break;
      }
      case "getChildSessions": {
        const children = await this.agent.getChildSessions(message.sessionId);
        this.postMessage({ type: "childSessions", sessionId: message.sessionId, children });
        break;
      }
      case "getAgents": {
        const agents = await this.agent.getAgents();
        this.postMessage({ type: "agents", agents });
        break;
      }
      case "shareSession": {
        const session = await this.agent.shareSession(message.sessionId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        // 共有 URL をクリップボードにコピーする
        if (session.share?.url) {
          await this.platformServices.copyToClipboard(session.share.url);
        }
        break;
      }
      case "unshareSession": {
        const session = await this.agent.unshareSession(message.sessionId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        break;
      }
      case "copyToClipboard": {
        await this.platformServices.copyToClipboard(message.text);
        break;
      }
      case "undoSession": {
        const session = await this.agent.revertSession(message.sessionId, message.messageId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const messages = await this.agent.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages });
        break;
      }
      case "redoSession": {
        const session = await this.agent.unrevertSession(message.sessionId);
        this.activeSession = session;
        this.postMessage({ type: "activeSession", session });
        const messages = await this.agent.getMessages(message.sessionId);
        this.postMessage({ type: "messages", sessionId: message.sessionId, messages });
        break;
      }
      case "openDiffEditor": {
        await this.platformServices.openDiffEditor(message.filePath, message.before, message.after);
        break;
      }
    }
  }

  /** アクティブなテキストエディタから FileAttachment を生成する。エディタがない場合は null を返す。 */
  private getActiveEditorFile(
    editor: vscode.TextEditor | undefined,
  ): import("@opencodegui/core").FileAttachment | null {
    if (!editor) return null;
    const uri = editor.document.uri;
    // 出力パネルや設定画面など、file スキーム以外は対象外
    if (uri.scheme !== "file") return null;
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri;
    const relativePath = workspaceFolder
      ? path.relative(workspaceFolder.fsPath, uri.fsPath)
      : path.basename(uri.fsPath);
    return { filePath: relativePath, fileName: path.basename(uri.fsPath) };
  }

  private postMessage(message: HostToUIMessage): void {
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
