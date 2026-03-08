/**
 * @opencodegui/core - Domain types
 *
 * Agent/platform-independent types representing the application's domain.
 * These types are shaped to match the actual data flowing through the system
 * (originally from @opencode-ai/sdk) so that the webview can consume them
 * without depending on any specific agent SDK.
 */

// ============================================================
// Chat Session
// ============================================================

export type ChatSession = {
  id: string;
  title: string;
  parentID?: string;
  share?: { url: string };
  revert?: unknown;
  summary?: {
    additions: number;
    deletions: number;
    files: number;
    diffs?: FileDiff[];
  };
  time: {
    created: number;
    updated: number;
    compacting?: number;
  };
  version?: string;
  projectID?: string;
  directory?: string;
};

// ============================================================
// Chat Message
// ============================================================

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  sessionID: string;
  time: {
    created: number;
    completed?: number;
  };
  // assistant-specific fields (optional on user messages)
  parentID?: string;
  modelID?: string;
  providerID?: string;
  model?: { providerID: string; modelID: string };
  cost?: number;
  tokens?: {
    input: number;
    output: number;
    reasoning: number;
    cache: { read: number; write: number };
  };
  error?: unknown;
  summary?: unknown;
  agent?: string;
  finish?: unknown;
  mode?: string;
  path?: { cwd: string; root: string };
  system?: unknown;
  tools?: unknown;
};

// ============================================================
// Message Parts
// ============================================================

export type TextPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "text";
  text: string;
  synthetic?: boolean;
  ignored?: boolean;
  time?: unknown;
  metadata?: unknown;
};

export type ReasoningPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "reasoning";
  text: string;
  time?: { start: number; end?: number };
  metadata?: unknown;
};

export type ToolStatePending = { status: "pending" };
export type ToolStateRunning = {
  status: "running";
  input: unknown;
  title?: string;
  metadata?: unknown;
};
export type ToolStateCompleted = {
  status: "completed";
  input: unknown;
  output: unknown;
  title?: string;
  metadata?: unknown;
};
export type ToolStateError = {
  status: "error";
  input: unknown;
  error: string;
  title?: string;
  metadata?: unknown;
};

export type ToolState = ToolStatePending | ToolStateRunning | ToolStateCompleted | ToolStateError;

export type ToolPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "tool";
  callID: string;
  tool: string;
  state: ToolState;
  metadata?: unknown;
};

export type FilePart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "file";
  url: string;
  filename: string;
  mime: string;
};

export type StepStartPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "step-start";
};

export type StepFinishPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "step-finish";
  tokens?: { input: number; output: number };
};

export type AgentPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "agent";
  name: string;
};

export type SubtaskPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "subtask";
  prompt: string;
  description?: string;
  agent?: string;
  model?: { providerID: string; modelID: string };
  input: unknown;
  metadata?: unknown;
};

export type SnapshotPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "snapshot";
  snapshot: string;
};

export type PatchPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "patch";
  diff: string;
};

export type RetryPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "retry";
};

export type CompactionPart = {
  id: string;
  sessionID: string;
  messageID: string;
  type: "compaction";
};

/** Union of all message part types */
export type MessagePart =
  | TextPart
  | ReasoningPart
  | ToolPart
  | FilePart
  | StepStartPart
  | StepFinishPart
  | AgentPart
  | SubtaskPart
  | SnapshotPart
  | PatchPart
  | RetryPart
  | CompactionPart;

export type ChatMessageWithParts = {
  info: ChatMessage;
  parts: MessagePart[];
};

// ============================================================
// Agent Events (SSE stream)
// ============================================================

export type AgentEvent =
  | {
      type: "session.updated";
      properties: { info: ChatSession };
    }
  | {
      type: "session.created";
      properties: { info: ChatSession };
    }
  | {
      type: "session.deleted";
      properties: { info: ChatSession };
    }
  | {
      type: "session.status";
      properties: { sessionID: string; status: { type: "busy" | "idle" } };
    }
  | {
      type: "session.diff";
      properties: { sessionID: string; diff: FileDiff[] };
    }
  | {
      type: "session.error";
      properties: { sessionID: string; error: string };
    }
  | {
      type: "message.updated";
      properties: { info: ChatMessage; parts: MessagePart[] };
    }
  | {
      type: "message.removed";
      properties: { sessionID: string; messageID: string };
    }
  | {
      type: "message.part.updated";
      properties: { sessionID: string; part: MessagePart };
    }
  | {
      type: "message.part.removed";
      properties: { sessionID: string; partID: string };
    }
  | {
      type: "permission.asked";
      properties: Permission;
    }
  | {
      type: "permission.replied";
      properties: { sessionID: string; requestID: string; reply: PermissionResponse };
    }
  | {
      type: "todo.updated";
      properties: { sessionID: string; todos: TodoItem[] };
    }
  | {
      type: "question.asked";
      properties: QuestionRequest;
    }
  | {
      type: "question.replied";
      properties: { sessionID: string; requestID: string };
    }
  | {
      type: "question.rejected";
      properties: { sessionID: string; requestID: string };
    }
  | {
      type: "file.edited";
      properties: { sessionID: string; file: string };
    };

// ============================================================
// Model Reference
// ============================================================

export type ModelRef = {
  providerID: string;
  modelID: string;
};

// ============================================================
// Permissions
// ============================================================

export type Permission = {
  id: string;
  sessionID: string;
  permission: string;
  patterns: string[];
  metadata: Record<string, unknown>;
  always: string[];
  tool?: {
    messageID: string;
    callID: string;
  };
};

export type PermissionResponse = "once" | "always" | "reject";

// ============================================================
// Questions (AI → User interactive questions)
// ============================================================

export type QuestionOption = {
  label: string;
  description: string;
};

export type QuestionInfo = {
  question: string;
  header: string;
  options: QuestionOption[];
  multiple?: boolean;
  custom?: boolean;
};

export type QuestionRequest = {
  id: string;
  sessionID: string;
  questions: QuestionInfo[];
  tool?: {
    messageID: string;
    callID: string;
  };
};

export type QuestionAnswer = string[];

// ============================================================
// File Attachment (local files for message context)
// ============================================================

export type FileAttachment = {
  filePath: string;
  fileName: string;
};

// ============================================================
// File Diff
// ============================================================

export type FileDiff = {
  file: string;
  before: string;
  after: string;
  additions: number;
  deletions: number;
};

// ============================================================
// Todo
// ============================================================

export type TodoItem = {
  id: string;
  content: string;
  status: string;
  priority: string;
};

// ============================================================
// Providers & Models
// ============================================================

export type ProviderInfo = {
  id: string;
  name: string;
  env: string[];
  api?: string;
  npm?: string;
  models: Record<string, ModelInfo>;
};

export type ModelInfo = {
  id: string;
  name: string;
  release_date?: string;
  attachment?: boolean;
  reasoning?: boolean;
  temperature?: boolean;
  tool_call?: boolean;
  cost?: {
    input: number;
    output: number;
    cache_read?: number;
    cache_write?: number;
  };
  limit: { context: number; output: number };
  status?: string;
  experimental?: boolean;
  options?: Record<string, unknown>;
};

export type AllProvidersData = {
  all: ProviderInfo[];
  default: Record<string, string>;
  connected: string[];
};

// ============================================================
// Agent Info
// ============================================================

export type AgentInfo = {
  name: string;
  description?: string;
  mode?: string;
  builtIn?: boolean;
  color?: string;
};

// ============================================================
// App Config & Paths
// ============================================================

export type AppConfig = Record<string, unknown>;

export type AppPaths = {
  home?: string;
  config: string;
  state: string;
  directory: string;
};

// ============================================================
// Send Message Options
// ============================================================

export type SendMessageOptions = {
  model?: ModelRef;
  files?: FileAttachment[];
  agent?: string;
  primaryAgent?: string;
};

// ============================================================
// MCP
// ============================================================

export type McpStatus = Record<string, unknown>;

// ============================================================
// Tool
// ============================================================

export type ToolListItem = {
  id: string;
  description?: string;
  parameters?: unknown;
};

// ============================================================
// Disposable
// ============================================================

export type Disposable = {
  dispose(): void;
};
