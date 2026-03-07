/**
 * VscodePlatformServices - IPlatformServices implementation for VS Code.
 *
 * Encapsulates all VS Code-specific platform operations that were previously
 * embedded in ChatViewProvider's message handlers.
 */

import * as path from "node:path";
import type { FileAttachment, IPlatformServices } from "@opencodegui/core";
import * as vscode from "vscode";

export class VscodePlatformServices implements IPlatformServices {
  async openDiffEditor(filePath: string, before: string, after: string): Promise<void> {
    // 仮想ドキュメントを使って VS Code のネイティブ diff エディタを開く
    const beforeUri = vscode.Uri.parse(`opencode-diff-before:${filePath}?${encodeURIComponent(before)}`);
    const afterUri = vscode.Uri.parse(`opencode-diff-after:${filePath}?${encodeURIComponent(after)}`);
    const fileName = path.basename(filePath);
    await vscode.commands.executeCommand("vscode.diff", beforeUri, afterUri, `${fileName} (Changes)`);
  }

  async copyToClipboard(text: string): Promise<void> {
    await vscode.env.clipboard.writeText(text);
  }

  async openTerminal(serverUrl: string, sessionId?: string): Promise<void> {
    const args = ["attach", serverUrl];
    if (sessionId) {
      args.push("--session", sessionId);
    }
    const wsFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const terminal = vscode.window.createTerminal({
      name: "OpenCode",
      cwd: wsFolder,
    });
    terminal.show();
    terminal.sendText(`opencode ${args.map((a) => JSON.stringify(a)).join(" ")}`);
  }

  async openConfigFile(filePath: string): Promise<void> {
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
  }

  async openFile(filePath: string, line?: number): Promise<void> {
    const uri = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(doc);
    if (line !== undefined && line >= 1) {
      const position = new vscode.Position(line - 1, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
    }
  }

  async searchWorkspaceFiles(query: string): Promise<FileAttachment[]> {
    const pattern = query ? `**/*${query}*` : "**/*";
    const uris = await vscode.workspace.findFiles(pattern, "**/node_modules/**", 20);
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri;
    return uris.map((uri) => {
      const relativePath = workspaceFolder
        ? path.relative(workspaceFolder.fsPath, uri.fsPath)
        : path.basename(uri.fsPath);
      return { filePath: relativePath, fileName: path.basename(uri.fsPath) };
    });
  }

  async getOpenEditors(): Promise<FileAttachment[]> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri;
    return (
      vscode.window.tabGroups.all
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
        .filter((f, i, arr) => arr.findIndex((a) => a.filePath === f.filePath) === i)
    );
  }
}
