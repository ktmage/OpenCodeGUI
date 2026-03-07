import { vi } from "vitest";

// vscode モジュールは VS Code Extension Host でのみ利用可能。
// Node.js 環境のユニットテストではモジュール全体をモックに差し替える。
vi.mock("vscode", () => import("./mocks/vscode"));
