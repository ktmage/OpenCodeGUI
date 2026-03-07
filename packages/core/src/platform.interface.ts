/**
 * @opencodegui/core - Platform Interface
 *
 * Defines the contract for platform-specific functionality.
 * Each platform (VS Code, Electron, Web, etc.) implements these interfaces.
 */

import type { Disposable, FileAttachment } from "./domain";
import type { HostToUIMessage, UIToHostMessage } from "./protocol";

/** UI <-> Platform communication bridge */
export interface IBridge {
  postMessage(message: UIToHostMessage): void;
  onMessage(handler: (message: HostToUIMessage) => void): Disposable;
  getPersistedState(): UIPersistedState | null;
  setPersistedState(state: UIPersistedState): void;
}

export type SoundEventType = "responseComplete" | "permissionRequest" | "error";

export type SoundEventSetting = {
  enabled?: boolean;
  volume?: number;
};

export type SoundSettings = {
  [K in SoundEventType]?: SoundEventSetting;
};

export type UIPersistedState = {
  localeSetting?: "auto" | "en" | "ja";
  inputHistory?: string[];
  soundSettings?: SoundSettings;
};

/** Platform-specific services */
export interface IPlatformServices {
  /** Open a diff viewer */
  openDiffEditor(filePath: string, before: string, after: string): Promise<void>;

  /** Copy text to clipboard */
  copyToClipboard(text: string): Promise<void>;

  /** Open a terminal and connect to the agent's server */
  openTerminal(serverUrl: string, sessionId?: string): Promise<void>;

  /** Open a config file in the editor */
  openConfigFile(filePath: string): Promise<void>;

  /** Open a file in the editor, optionally at a specific line */
  openFile(filePath: string, line?: number): Promise<void>;

  /** Search for files in the workspace */
  searchWorkspaceFiles(query: string): Promise<FileAttachment[]>;

  /** Get currently open editor files */
  getOpenEditors(): Promise<FileAttachment[]>;
}
