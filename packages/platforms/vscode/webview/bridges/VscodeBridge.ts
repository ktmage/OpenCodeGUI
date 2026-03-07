/**
 * VscodeBridge - IBridge implementation for VS Code webview.
 *
 * Wraps the VS Code webview API (acquireVsCodeApi) to provide
 * platform-independent communication between UI and extension host.
 */

import type { Disposable, HostToUIMessage, IBridge, UIPersistedState, UIToHostMessage } from "@opencodegui/core";

interface VsCodeApi {
  postMessage(message: UIToHostMessage): void;
  getState(): UIPersistedState | undefined;
  setState(state: UIPersistedState): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

/**
 * VS Code webview bridge implementation.
 * acquireVsCodeApi() can only be called once, so this is a singleton.
 */
class VscodeBridge implements IBridge {
  private readonly vscodeApi: VsCodeApi;

  constructor() {
    this.vscodeApi = acquireVsCodeApi();
  }

  postMessage(message: UIToHostMessage): void {
    this.vscodeApi.postMessage(message);
  }

  onMessage(handler: (message: HostToUIMessage) => void): Disposable {
    const listener = (e: MessageEvent<HostToUIMessage>) => {
      handler(e.data);
    };
    window.addEventListener("message", listener);
    return {
      dispose() {
        window.removeEventListener("message", listener);
      },
    };
  }

  getPersistedState(): UIPersistedState | null {
    return this.vscodeApi.getState() ?? null;
  }

  setPersistedState(state: UIPersistedState): void {
    this.vscodeApi.setState(state);
  }
}

/** Singleton bridge instance */
export const bridge: IBridge = new VscodeBridge();
