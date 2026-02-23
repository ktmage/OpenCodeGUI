import * as vscode from "vscode";
import { OpenCodeConnection } from "./opencode-client";
import { ChatViewProvider } from "./chat-view-provider";

const connection = new OpenCodeConnection();

export async function activate(context: vscode.ExtensionContext) {
  await connection.connect();

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
