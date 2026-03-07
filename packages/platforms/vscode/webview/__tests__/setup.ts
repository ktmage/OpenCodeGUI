import * as matchers from "@testing-library/jest-dom/matchers";
import { beforeEach, describe, expect, vi } from "vitest";

expect.extend(matchers);

// --- RSpec スタイルの context エイリアス ---
// ネストされた describe を意味的に区別するために使用する。

declare global {
  // eslint-disable-next-line no-var
  var context: typeof describe;
}

globalThis.context = describe;

// --- jsdom に存在しない DOM API のスタブ ---

Element.prototype.scrollIntoView = vi.fn();

// --- AudioContext モック ---
// jsdom には Web Audio API が存在しないため、テスト用のモックを提供する。

globalThis.AudioContext = vi.fn(function (this: Record<string, unknown>) {
  this.currentTime = 0;
  this.destination = {};
  this.createOscillator = vi.fn(() => ({
    type: "sine",
    frequency: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  }));
  this.createGain = vi.fn(() => ({
    gain: { value: 0 },
    connect: vi.fn(),
  }));
}) as unknown as typeof AudioContext;

// --- vscode-api モック ---
// acquireVsCodeApi はグローバル関数として宣言されており、webview/vscode-api.ts のモジュールスコープで呼ばれる。
// モジュール全体をモックにして postMessage / getPersistedState / setPersistedState をスパイ化する。

vi.mock("../vscode-api", () => ({
  postMessage: vi.fn(),
  getPersistedState: vi.fn(() => undefined),
  setPersistedState: vi.fn(),
}));

// --- marked モック ---
// TextPartView は Marked インスタンスを使うが、テストでは markdown レンダリングの検証は不要。
// プレーンテキストをそのまま <p> タグで返す。

vi.mock("marked", () => ({
  Marked: class {
    parse(text: string) {
      return `<p>${text}</p>`;
    }
  },
  marked: {
    parse: (text: string) => `<p>${text}</p>`,
    setOptions: vi.fn(),
    use: vi.fn(),
  },
}));

// --- テストごとのリセット ---

beforeEach(() => {
  vi.clearAllMocks();
});
