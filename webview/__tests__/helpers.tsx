import { act, render } from "@testing-library/react";
import { App } from "../App";
import type { ExtToWebviewMessage } from "../vscode-api";

/**
 * Extension Host → Webview メッセージを擬似送信する。
 * chat-view-provider.ts が panel.webview.postMessage() で送るメッセージを再現する。
 */
export async function sendExtMessage(msg: ExtToWebviewMessage): Promise<void> {
  await act(async () => {
    window.dispatchEvent(new MessageEvent("message", { data: msg }));
  });
}

/**
 * App をレンダリングし、render 結果を返す。
 * マウント時に postMessage("ready") と postMessage("getOpenEditors") が呼ばれる。
 */
export function renderApp() {
  return render(<App />);
}
