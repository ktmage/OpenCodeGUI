import * as vscode from "vscode";
import { OpenCodeConnection } from "./opencode-client";
import { ChatViewProvider } from "./chat-view-provider";

const connection = new OpenCodeConnection();

// Extension Host プロセスが強制終了された場合でもサーバーを停止する
process.on("exit", () => connection.disconnect());

export async function activate(context: vscode.ExtensionContext) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!workspaceFolder) {
    throw new Error("OpenCodeGUI requires an open workspace folder.");
  }

  // SDK の createOpencodeServer は cwd オプションを持たないため、
  // プロセスのカレントディレクトリを変更してからサーバーを起動する。
  const originalCwd = process.cwd();
  process.chdir(workspaceFolder);
  try {
    connection.workspaceFolder = workspaceFolder;
    await connection.connect();
  } finally {
    process.chdir(originalCwd);
  }

  const chatViewProvider = new ChatViewProvider(context.extensionUri, connection);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ChatViewProvider.viewType,
      chatViewProvider,
    ),
  );

  context.subscriptions.push(
    new vscode.Disposable(() => connection.disconnect()),
  );
}

export function deactivate() {
  connection.disconnect();
}
