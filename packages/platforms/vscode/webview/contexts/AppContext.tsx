import type {
  ChatSession,
  FileDiff,
  Permission,
  ProviderInfo,
  QuestionRequest,
  SoundEventSetting,
  SoundEventType,
  SoundSettings,
  TodoItem,
} from "@opencodegui/core";
import { createContext, useContext } from "react";
import type { MessageWithParts } from "../hooks/useMessages";
import type { LocaleSetting } from "../locales";
import type { AllProvidersData, FileAttachment } from "../vscode-api";

export type AppContextValue = {
  // Session
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  sessionBusy: boolean;
  showSessionList: boolean;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onToggleSessionList: () => void;

  // Messages
  messages: MessageWithParts[];
  latestTodos: TodoItem[];
  prefillText: string;
  onPrefillConsumed: () => void;

  // Providers & Model
  providers: ProviderInfo[];
  allProvidersData: AllProvidersData | null;
  selectedModel: { providerID: string; modelID: string } | null;
  onModelSelect: (model: { providerID: string; modelID: string }) => void;

  // Permissions
  permissions: Map<string, Permission>;

  // Questions
  questions: Map<string, QuestionRequest>;

  // Files
  openEditors: FileAttachment[];
  workspaceFiles: FileAttachment[];

  // File Changes
  fileDiffs: FileDiff[];
  difitAvailable: boolean;
  onOpenDiffEditor: (filePath: string, before: string, after: string) => void;
  onOpenFile: (filePath: string, line?: number) => void;

  // Actions
  onSend: (text: string, files: FileAttachment[]) => void;
  onShellExecute: (command: string) => void;
  isShellMessage: (messageId: string) => boolean;
  onAbort: () => void;
  onEditAndResend: (messageId: string, text: string) => void;
  onRevertToCheckpoint: (assistantMessageId: string, userText: string | null) => void;
  onForkFromCheckpoint: (messageId: string) => void;

  // Settings
  openCodePaths: { home?: string; config: string; state: string; directory: string } | null;
  onOpenConfigFile: (filePath: string) => void;
  onOpenTerminal: () => void;
  localeSetting: LocaleSetting;
  onLocaleSettingChange: (setting: LocaleSetting) => void;
  soundSettings: SoundSettings;
  onSoundSettingChange: (eventType: SoundEventType, setting: Partial<SoundEventSetting>) => void;

  // Child Sessions
  childSessions: ChatSession[];
  onNavigateToChild: (sessionId: string) => void;
  onNavigateToParent: () => void;
};

// Context は AppProvider 内でのみ使用される想定。
// Provider 外で useAppContext() を呼んだ場合はランタイムエラーで即座に気づけるよう null を初期値とする。
const AppContext = createContext<AppContextValue | null>(null);

export const AppContextProvider = AppContext.Provider;

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }
  return ctx;
}
