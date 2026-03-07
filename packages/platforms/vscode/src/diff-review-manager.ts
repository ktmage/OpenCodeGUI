import type { ChildProcess } from "node:child_process";
import { spawn } from "node:child_process";
import type { FileDiff } from "@opencodegui/core";
import { createTwoFilesPatch } from "diff";
import * as vscode from "vscode";

/**
 * difit プロセスのライフサイクル管理を担当する。
 * ワークスペースごとに 1 つの difit プロセスを保持し、
 * システムブラウザで差分レビュー画面を開く。
 */
export class DiffReviewManager implements vscode.Disposable {
  private process: ChildProcess | null = null;
  private serverUrl: string | null = null;

  /**
   * difit プロセスを起動しシステムブラウザでレビュー画面を開く。
   * 既にプロセスが起動中の場合は kill して再起動する。
   */
  async start(diffs: FileDiff[], focusFile?: string): Promise<void> {
    this.stop();

    const unifiedDiff = fileDiffsToUnifiedDiff(diffs);

    const url = await this.spawnDifit(unifiedDiff);
    this.serverUrl = url;

    const targetUrl = focusFile ? `${url}#${focusFile}` : url;
    await vscode.env.openExternal(vscode.Uri.parse(targetUrl));
  }

  /** 実行中の difit プロセスを停止する */
  stop(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.serverUrl = null;
    }
  }

  dispose(): void {
    this.stop();
  }

  /**
   * difit を子プロセスとして起動し、stdin に unified diff を書き込む。
   * stdout から http://... の URL を検出して返す。
   */
  private spawnDifit(unifiedDiff: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const child = spawn("difit", ["-", "--no-open"], { stdio: ["pipe", "pipe", "pipe"] });
      this.process = child;

      const { stdout, stderr, stdin } = child;
      if (!stdout || !stderr || !stdin) {
        reject(new Error("Failed to create stdio streams"));
        return;
      }

      let output = "";
      const urlPattern = /https?:\/\/(?:localhost|127\.0\.0\.1):\d+/;

      const handleData = (chunk: Buffer) => {
        output += chunk.toString();
        // difit は起動後に "http://localhost:XXXX" を stderr に出力する
        const match = output.match(urlPattern);
        if (match) {
          resolve(match[0]);
        }
      };

      stdout.on("data", handleData);
      stderr.on("data", handleData);

      child.on("error", (err) => {
        this.process = null;
        reject(err);
      });

      child.on("close", (code) => {
        this.process = null;
        if (!this.serverUrl) {
          reject(new Error(`difit exited with code ${code} before emitting URL`));
        }
      });

      stdin.write(unifiedDiff);
      stdin.end();
    });
  }
}

/**
 * FileDiff[] を git diff 形式のテキストに変換する。
 * difit は `diff --git` ヘッダーを必要とするため、jsdiff の出力を変換する。
 */
export function fileDiffsToUnifiedDiff(diffs: FileDiff[]): string {
  return diffs
    .map((d) => {
      const patch = createTwoFilesPatch(`a/${d.file}`, `b/${d.file}`, d.before, d.after);
      // jsdiff は "===...===" ヘッダーを出力するが difit は "diff --git" を期待する
      return patch.replace(/^={10,}\n/, `diff --git a/${d.file} b/${d.file}\n`);
    })
    .join("\n");
}
