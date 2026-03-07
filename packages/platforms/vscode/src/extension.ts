import { execFile } from "node:child_process";
import { OpenCodeAgent } from "@opencodegui/agent-opencode";
import * as vscode from "vscode";
import { ChatViewProvider } from "./chat-view-provider";
import { DiffReviewManager } from "./diff-review-manager";
import { VscodePlatformServices } from "./vscode-platform-services";

const agent = new OpenCodeAgent();

// Extension Host プロセスが強制終了された場合でもサーバーを停止する
process.on("exit", () => agent.disconnect());

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceFolder) {
    vscode.window.showWarningMessage(vscode.l10n.t("OpenCodeGUI requires an open workspace folder."));
    return;
  }

  // SDK の createOpencodeServer は cwd オプションを持たないため、
  // プロセスのカレントディレクトリを変更してからサーバーを起動する。
  const originalCwd = process.cwd();
  process.chdir(workspaceFolder);
  try {
    agent.workspaceFolder = workspaceFolder;
    await agent.connect();
  } catch (error) {
    const isNotFound =
      error instanceof Error &&
      (("code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") || error.message.includes("ENOENT"));
    if (isNotFound) {
      vscode.window.showWarningMessage(
        vscode.l10n.t(
          'OpenCodeGUI: "opencode" command not found. Please install OpenCode first: https://github.com/anomalyco/opencode',
        ),
      );
      return;
    }
    throw error;
  } finally {
    process.chdir(originalCwd);
  }

  const platformServices = new VscodePlatformServices();

  // PATH 上に difit が存在するか確認する。
  // 存在しない場合はレビューボタンを非表示にするだけでエラーは出さない。
  const difitAvailable = await checkDifitAvailable();

  const diffReviewManager = new DiffReviewManager();
  const chatViewProvider = new ChatViewProvider(
    context.extensionUri,
    agent,
    platformServices,
    diffReviewManager,
    difitAvailable,
  );
  context.subscriptions.push(vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatViewProvider));
  context.subscriptions.push(diffReviewManager);

  // diff エディタ用の仮想ドキュメントプロバイダー。
  // URI のクエリ部分にエンコードされたコンテンツを返す。
  const diffContentProvider: vscode.TextDocumentContentProvider = {
    provideTextDocumentContent(uri: vscode.Uri): string {
      return decodeURIComponent(uri.query);
    },
  };
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider("opencode-diff-before", diffContentProvider),
    vscode.workspace.registerTextDocumentContentProvider("opencode-diff-after", diffContentProvider),
  );

  context.subscriptions.push(new vscode.Disposable(() => agent.disconnect()));
}

export function deactivate() {
  agent.disconnect();
}

/** PATH 上に difit コマンドが存在するかチェックする */
function checkDifitAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    execFile("which", ["difit"], (error) => {
      resolve(!error);
    });
  });
}
