import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, vi } from "vitest";

// --- RSpec スタイルの context エイリアス ---
// ネストされた describe を意味的に区別するために使用する。

declare global {
  // eslint-disable-next-line no-var
  var context: typeof describe;
}

globalThis.context = describe;

// --- jsdom に存在しない DOM API のスタブ ---

Element.prototype.scrollIntoView = vi.fn();

// --- vscode-api モック ---
// acquireVsCodeApi はグローバル関数として宣言されており、webview/vscode-api.ts のモジュールスコープで呼ばれる。
// モジュール全体をモックにして postMessage / getPersistedState / setPersistedState をスパイ化する。

vi.mock("../vscode-api", () => ({
  postMessage: vi.fn(),
  getPersistedState: vi.fn(() => undefined),
  setPersistedState: vi.fn(),
}));

// --- marked モック ---
// TextPartView は marked.parse を使うが、テストでは markdown レンダリングの検証は不要。
// プレーンテキストをそのまま <p> タグで返す。

vi.mock("marked", () => ({
  marked: {
    parse: (text: string) => `<p>${text}</p>`,
    setOptions: vi.fn(),
  },
}));

// --- テストごとのリセット ---

beforeEach(() => {
  vi.clearAllMocks();
});
