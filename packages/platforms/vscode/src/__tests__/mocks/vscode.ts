/**
 * vscode モジュールのモック実装。
 * extension host テストで `vi.mock("vscode")` 経由で使われる。
 * テスト対象のコードが参照する API のみ最小限にスタブ化する。
 */
import { vi } from "vitest";

// --- workspace ---
export const workspace = {
  workspaceFolders: [{ uri: { fsPath: "/workspace", scheme: "file" } }],
  findFiles: vi.fn().mockResolvedValue([]),
  registerTextDocumentContentProvider: vi.fn(() => ({ dispose: vi.fn() })),
  openTextDocument: vi.fn().mockResolvedValue({}),
  fs: {
    stat: vi.fn().mockResolvedValue(undefined),
    createDirectory: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
};

// --- window ---
export const window = {
  registerWebviewViewProvider: vi.fn(() => ({ dispose: vi.fn() })),
  showWarningMessage: vi.fn(),
  showTextDocument: vi.fn().mockResolvedValue(undefined),
  activeTextEditor: undefined as unknown,
  onDidChangeActiveTextEditor: vi.fn(() => ({ dispose: vi.fn() })),
  tabGroups: { all: [] as unknown[] },
  createTerminal: vi.fn(() => ({ show: vi.fn(), sendText: vi.fn() })),
};

// --- env ---
export const env = {
  language: "en",
  clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
};

// --- commands ---
export const commands = {
  executeCommand: vi.fn().mockResolvedValue(undefined),
};

// --- l10n ---
export const l10n = {
  t: vi.fn((s: string) => s),
};

// --- Uri ---
export const Uri = {
  joinPath: vi.fn((base: { fsPath: string }, ...segments: string[]) => {
    const joined = [base.fsPath, ...segments].join("/");
    return { fsPath: joined, scheme: "file", toString: () => joined };
  }),
  file: vi.fn((p: string) => ({ fsPath: p, scheme: "file", toString: () => `file://${p}` })),
  parse: vi.fn((s: string) => {
    // 簡易的に scheme:path?query をパース
    const match = s.match(/^([^:]+):(.+?)(\?(.*))?$/);
    return {
      scheme: match?.[1] ?? "",
      path: match?.[2] ?? s,
      query: match?.[4] ?? "",
      fsPath: match?.[2] ?? s,
      toString: () => s,
    };
  }),
};

// --- Disposable ---
export class Disposable {
  private callback: () => void;
  constructor(callback: () => void) {
    this.callback = callback;
  }
  dispose(): void {
    this.callback();
  }
}

// --- TabInputText ---
export class TabInputText {
  public uri: { fsPath: string; scheme: string };
  constructor(uri: { fsPath: string; scheme: string }) {
    this.uri = uri;
  }
}

// --- CancellationToken ---
export const CancellationTokenSource = vi.fn(() => ({
  token: { isCancellationRequested: false, onCancellationRequested: vi.fn() },
  cancel: vi.fn(),
  dispose: vi.fn(),
}));
