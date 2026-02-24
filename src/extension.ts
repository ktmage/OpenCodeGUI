import * as vscode from "vscode";
import { ChatViewProvider } from "./chat-view-provider";
import { OpenCodeConnection } from "./opencode-client";

const connection = new OpenCodeConnection();

// Extension Host プロセスが強制終了された場合でもサーバーを停止する
process.on("exit", () => connection.disconnect());

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
    connection.workspaceFolder = workspaceFolder;
    await connection.connect();
  } catch (error) {
    const isNotFound =
      error instanceof Error &&
      (("code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") || error.message.includes("ENOENT"));
    if (isNotFound) {
      vscode.window.showWarningMessage(
        vscode.l10n.t(
          'OpenCodeGUI: "opencode" command not found. Please install OpenCode first: https://github.com/opencode-ai/opencode',
        ),
      );
      return;
    }
    throw error;
  } finally {
    process.chdir(originalCwd);
  }

  const chatViewProvider = new ChatViewProvider(context.extensionUri, connection);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatViewProvider));

  context.subscriptions.push(new vscode.Disposable(() => connection.disconnect()));
}

export function deactivate() {
  connection.disconnect();
}
