/**
 * @opencodegui/core - Protocol Types
 *
 * Message types for UI <-> Host communication.
 * These define the protocol used between the webview (React UI) and the
 * host process (VS Code extension host, Electron main process, etc.).
 */

import type { AgentCapabilities } from "./agent.interface";
import type {
  AgentEvent,
  AgentInfo,
  AllProvidersData,
  AppPaths,
  ChatMessageWithParts,
  ChatSession,
  FileAttachment,
  FileDiff,
  ModelRef,
  PermissionResponse,
  ProviderInfo,
  QuestionAnswer,
  SendMessageOptions,
  TodoItem,
} from "./domain";

// ============================================================
// UI -> Host
// ============================================================

export type UIToHostMessage =
  // --- Lifecycle ---
  | { type: "ready" }

  // --- Session operations (via agent) ---
  | { type: "createSession"; title?: string }
  | { type: "selectSession"; sessionId: string }
  | { type: "deleteSession"; sessionId: string }
  | { type: "forkSession"; sessionId: string; messageId?: string }
  | { type: "shareSession"; sessionId: string }
  | { type: "unshareSession"; sessionId: string }
  | {
      type: "compressSession";
      sessionId: string;
      model?: ModelRef;
    }
  | {
      type: "undoSession";
      sessionId: string;
      messageId: string;
    }
  | { type: "redoSession"; sessionId: string }

  // --- Message operations (via agent) ---
  | {
      type: "sendMessage";
      sessionId: string;
      text: string;
      model?: ModelRef;
      files?: FileAttachment[];
      agent?: string;
    }
  | {
      type: "editAndResend";
      sessionId: string;
      messageId: string;
      text: string;
      model?: ModelRef;
      files?: FileAttachment[];
    }
  | { type: "abort"; sessionId: string }

  // --- Shell (via agent) ---
  | {
      type: "executeShell";
      sessionId: string;
      command: string;
      model?: ModelRef;
    }

  // --- Permissions (via agent) ---
  | {
      type: "replyPermission";
      sessionId: string;
      permissionId: string;
      response: PermissionResponse;
    }

  // --- Questions (via agent) ---
  | {
      type: "replyQuestion";
      requestId: string;
      answers: QuestionAnswer[];
    }
  | {
      type: "rejectQuestion";
      requestId: string;
    }

  // --- Data retrieval (via agent) ---
  | { type: "listSessions" }
  | { type: "getMessages"; sessionId: string }
  | { type: "getProviders" }
  | { type: "getSessionDiff"; sessionId: string }
  | { type: "getSessionTodos"; sessionId: string }
  | { type: "getChildSessions"; sessionId: string }
  | { type: "getAgents" }

  // --- Model config ---
  | { type: "setModel"; model: string }

  // --- Platform operations ---
  | { type: "getOpenEditors" }
  | { type: "searchWorkspaceFiles"; query: string }
  | { type: "openConfigFile"; filePath: string }
  | { type: "openTerminal" }
  | {
      type: "openDiffEditor";
      filePath: string;
      before: string;
      after: string;
    }
  | { type: "copyToClipboard"; text: string }

  // --- Legacy (kept during migration) ---
  | {
      type: "revertToMessage";
      sessionId: string;
      messageId: string;
    };

// ============================================================
// Host -> UI
// ============================================================

export type HostToUIMessage =
  // --- Initialization ---
  | {
      type: "init";
      capabilities: AgentCapabilities;
      locale: string;
      paths: AppPaths;
    }

  // --- Legacy messages (kept during migration, to be removed after Phase 2.7) ---
  | {
      type: "toolConfig";
      paths: { home: string; config: string; state: string; directory: string };
    }
  | { type: "locale"; vscodeLanguage: string }

  // --- Agent events (SSE forwarding) ---
  | { type: "event"; event: AgentEvent }

  // --- Sessions ---
  | { type: "sessions"; sessions: ChatSession[] }
  | { type: "activeSession"; session: ChatSession | null }

  // --- Messages ---
  | {
      type: "messages";
      sessionId: string;
      messages: ChatMessageWithParts[];
    }

  // --- Providers & models ---
  | {
      type: "providers";
      providers: ProviderInfo[];
      allProviders: AllProvidersData;
      default: Record<string, string>;
      configModel?: string;
    }
  | {
      type: "modelUpdated";
      model: string;
      default: Record<string, string>;
    }

  // --- Session metadata ---
  | { type: "sessionDiff"; sessionId: string; diffs: FileDiff[] }
  | { type: "sessionTodos"; sessionId: string; todos: TodoItem[] }
  | {
      type: "childSessions";
      sessionId: string;
      children: ChatSession[];
    }

  // --- Agent list ---
  | { type: "agents"; agents: AgentInfo[] }

  // --- Platform data ---
  | { type: "openEditors"; files: FileAttachment[] }
  | { type: "activeEditor"; file: FileAttachment | null }
  | { type: "workspaceFiles"; files: FileAttachment[] };
