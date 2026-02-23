import * as vscode from "vscode";
import { OpenCodeConnection } from "./opencode-client";

const connection = new OpenCodeConnection();

export async function activate(context: vscode.ExtensionContext) {
  await connection.connect();

  // Task 3 で WebviewViewProvider を登録する

  context.subscriptions.push(
    new vscode.Disposable(() => connection.disconnect()),
  );
}

export function deactivate() {
  connection.disconnect();
}
