/**
 * DiffReviewManager のユニットテスト。
 * child_process.spawn をモックし、difit プロセスの起動・URL 検出・停止を検証する。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
  execFile: vi.fn(),
}));

import { spawn } from "node:child_process";
import { EventEmitter, Readable, Writable } from "node:stream";
import * as vscode from "vscode";
import { DiffReviewManager, fileDiffsToUnifiedDiff } from "../diff-review-manager";

/** stdin / stdout / stderr を持つ擬似 ChildProcess を生成する */
function createMockProcess() {
  const proc = new EventEmitter() as EventEmitter & {
    stdin: Writable;
    stdout: Readable;
    stderr: Readable;
    kill: ReturnType<typeof vi.fn>;
    pid: number;
  };
  proc.stdin = new Writable({
    write(_chunk, _enc, cb) {
      cb();
    },
  });
  proc.stdout = new Readable({ read() {} });
  proc.stderr = new Readable({ read() {} });
  proc.kill = vi.fn();
  proc.pid = 12345;
  return proc;
}

describe("DiffReviewManager", () => {
  let manager: DiffReviewManager;

  beforeEach(() => {
    manager = new DiffReviewManager();
    vi.clearAllMocks();
  });

  afterEach(() => {
    manager.dispose();
  });

  // ============================================================
  // start()
  // ============================================================

  describe("start()", () => {
    // should spawn difit with correct arguments and open in browser
    it("difit を正しい引数で起動しブラウザで開くこと", async () => {
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as never);

      const startPromise = manager.start([
        { file: "src/index.ts", before: "old", after: "new", additions: 1, deletions: 1 },
      ]);

      mockProc.stdout.push("http://127.0.0.1:4966\n");
      await startPromise;

      expect(spawn).toHaveBeenCalledWith("difit", ["-", "--no-open"], { stdio: ["pipe", "pipe", "pipe"] });
      expect(vscode.env.openExternal).toHaveBeenCalled();
      const uri = vi.mocked(vscode.env.openExternal).mock.calls[0][0];
      expect(uri.toString()).toBe("http://127.0.0.1:4966");
    });

    // should pass focusFile as URL hash fragment
    it("focusFile を URL のハッシュフラグメントとして渡すこと", async () => {
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as never);

      const startPromise = manager.start(
        [{ file: "src/index.ts", before: "old", after: "new", additions: 1, deletions: 1 }],
        "src/index.ts",
      );

      mockProc.stdout.push("http://127.0.0.1:4966\n");
      await startPromise;

      const uri = vi.mocked(vscode.env.openExternal).mock.calls[0][0];
      expect(uri.toString()).toBe("http://127.0.0.1:4966#src/index.ts");
    });

    // should detect localhost URL (difit outputs http://localhost:XXXX)
    it("http://localhost:XXXX 形式の URL を検出できること", async () => {
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as never);

      const startPromise = manager.start([
        { file: "src/index.ts", before: "old", after: "new", additions: 1, deletions: 1 },
      ]);

      mockProc.stdout.push("http://localhost:4971\n");
      await startPromise;

      const uri = vi.mocked(vscode.env.openExternal).mock.calls[0][0];
      expect(uri.toString()).toBe("http://localhost:4971");
    });

    // should detect URL from stderr (difit outputs to stderr)
    it("stderr に出力された URL を検出できること", async () => {
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as never);

      const startPromise = manager.start([
        { file: "src/index.ts", before: "old", after: "new", additions: 1, deletions: 1 },
      ]);

      mockProc.stderr.push("🚀 difit server started on http://localhost:4971\n");
      await startPromise;

      const uri = vi.mocked(vscode.env.openExternal).mock.calls[0][0];
      expect(uri.toString()).toBe("http://localhost:4971");
    });

    // should kill existing process before starting new one
    it("既存プロセスを kill してから新しいプロセスを起動すること", async () => {
      const proc1 = createMockProcess();
      const proc2 = createMockProcess();
      vi.mocked(spawn)
        .mockReturnValueOnce(proc1 as never)
        .mockReturnValueOnce(proc2 as never);

      const start1 = manager.start([{ file: "a.ts", before: "", after: "x", additions: 1, deletions: 0 }]);
      proc1.stdout.push("http://127.0.0.1:4966\n");
      await start1;

      const start2 = manager.start([{ file: "b.ts", before: "", after: "y", additions: 1, deletions: 0 }]);
      proc2.stdout.push("http://127.0.0.1:4967\n");
      await start2;

      expect(proc1.kill).toHaveBeenCalled();
    });

    // should reject when difit exits before emitting URL
    it("URL 出力前に difit が終了した場合 reject すること", async () => {
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as never);

      const startPromise = manager.start([{ file: "a.ts", before: "", after: "x", additions: 1, deletions: 0 }]);

      mockProc.emit("close", 1);

      await expect(startPromise).rejects.toThrow("difit exited with code 1 before emitting URL");
    });

    // should reject on spawn error
    it("spawn エラー時に reject すること", async () => {
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as never);

      const startPromise = manager.start([{ file: "a.ts", before: "", after: "x", additions: 1, deletions: 0 }]);

      mockProc.emit("error", new Error("ENOENT"));

      await expect(startPromise).rejects.toThrow("ENOENT");
    });
  });

  // ============================================================
  // stop()
  // ============================================================

  describe("stop()", () => {
    // should kill the running process
    it("実行中のプロセスを kill すること", async () => {
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as never);

      const startPromise = manager.start([{ file: "a.ts", before: "", after: "x", additions: 1, deletions: 0 }]);
      mockProc.stdout.push("http://127.0.0.1:4966\n");
      await startPromise;

      manager.stop();

      expect(mockProc.kill).toHaveBeenCalled();
    });

    // should not throw when no process is running
    it("プロセスが起動していない場合でもエラーにならないこと", () => {
      expect(() => manager.stop()).not.toThrow();
    });
  });

  // ============================================================
  // dispose()
  // ============================================================

  describe("dispose()", () => {
    // should stop the running process
    it("実行中のプロセスを停止すること", async () => {
      const mockProc = createMockProcess();
      vi.mocked(spawn).mockReturnValue(mockProc as never);

      const startPromise = manager.start([{ file: "a.ts", before: "", after: "x", additions: 1, deletions: 0 }]);
      mockProc.stdout.push("http://127.0.0.1:4966\n");
      await startPromise;

      manager.dispose();

      expect(mockProc.kill).toHaveBeenCalled();
    });
  });
});

// ============================================================
// fileDiffsToUnifiedDiff
// ============================================================

describe("fileDiffsToUnifiedDiff", () => {
  // should convert FileDiff[] to unified diff text
  it("FileDiff[] を unified diff テキストに変換すること", () => {
    const result = fileDiffsToUnifiedDiff([
      { file: "src/index.ts", before: "const a = 1;\n", after: "const a = 2;\n", additions: 1, deletions: 1 },
    ]);

    expect(result).toContain("diff --git a/src/index.ts b/src/index.ts");
    expect(result).toContain("--- a/src/index.ts");
    expect(result).toContain("+++ b/src/index.ts");
    expect(result).toContain("-const a = 1;");
    expect(result).toContain("+const a = 2;");
    expect(result).not.toContain("===");
  });

  // should handle multiple files
  it("複数ファイルの差分を連結すること", () => {
    const result = fileDiffsToUnifiedDiff([
      { file: "a.ts", before: "a\n", after: "b\n", additions: 1, deletions: 1 },
      { file: "c.ts", before: "c\n", after: "d\n", additions: 1, deletions: 1 },
    ]);

    expect(result).toContain("diff --git a/a.ts b/a.ts");
    expect(result).toContain("diff --git a/c.ts b/c.ts");
    expect(result).toContain("--- a/a.ts");
    expect(result).toContain("--- a/c.ts");
  });

  // should handle new file (empty before)
  it("新規ファイル（before が空）を処理すること", () => {
    const result = fileDiffsToUnifiedDiff([
      { file: "new.ts", before: "", after: "hello\n", additions: 1, deletions: 0 },
    ]);

    expect(result).toContain("+hello");
  });
});
