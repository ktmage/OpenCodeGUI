/**
 * @opencodegui/core - Agent Interface
 *
 * Defines the contract between the UI/platform layer and any coding agent.
 * Each agent implementation (OpenCode, Claude Code, Codex, etc.) implements
 * this interface, hiding transport details (HTTP, stdio, WebSocket, etc.).
 */

import type {
  AgentEvent,
  AgentInfo,
  AllProvidersData,
  AppConfig,
  AppPaths,
  ChatMessageWithParts,
  ChatSession,
  Disposable,
  FileDiff,
  McpStatus,
  ModelRef,
  PermissionResponse,
  ProviderInfo,
  QuestionAnswer,
  SendMessageOptions,
  TodoItem,
  ToolListItem,
} from "./domain";

/** Agent capability declarations */
export type AgentCapabilities = {
  /** Session deletion */
  sessionDelete: boolean;
  /** Session fork (branch from any message) */
  sessionFork: boolean;
  /** Session revert / unrevert (undo / redo) */
  sessionRevert: boolean;
  /** Session sharing (URL generation) */
  sessionShare: boolean;
  /** Session summarization / context compression */
  sessionSummarize: boolean;
  /** Per-session file diffs */
  sessionDiff: boolean;
  /** Todo management */
  todo: boolean;
  /** Multi-provider model selection */
  multiProvider: boolean;
  /** Permission management (tool execution approval flow) */
  permission: boolean;
  /** Question interaction (AI asks user questions with options) */
  question: boolean;
  /** MCP (Model Context Protocol) support */
  mcp: boolean;
  /** Sub-agents (child sessions) */
  subAgent: boolean;
  /** Shell command execution */
  shell: boolean;
  /** Config management API */
  config: boolean;
};

export interface IAgent {
  // --- Capability declaration ---
  getCapabilities(): AgentCapabilities;

  // --- Lifecycle ---
  connect(): Promise<void>;
  disconnect(): void;

  // --- Event subscription ---
  onEvent(handler: (event: AgentEvent) => void): Disposable;

  // --- Sessions (common: all agents implement) ---
  listSessions(): Promise<ChatSession[]>;
  createSession(title?: string): Promise<ChatSession>;
  getSession(id: string): Promise<ChatSession>;

  // --- Sessions (capabilities-dependent) ---
  deleteSession(id: string): Promise<void>;
  forkSession(sessionId: string, messageId?: string): Promise<ChatSession>;
  revertSession(sessionId: string, messageId: string): Promise<ChatSession>;
  unrevertSession(sessionId: string): Promise<ChatSession>;
  summarizeSession(sessionId: string, model?: ModelRef): Promise<void>;
  shareSession(sessionId: string): Promise<ChatSession>;
  unshareSession(sessionId: string): Promise<ChatSession>;

  // --- Messages (common: all agents implement) ---
  getMessages(sessionId: string): Promise<ChatMessageWithParts[]>;
  sendMessage(sessionId: string, text: string, options?: SendMessageOptions): Promise<void>;
  abortSession(sessionId: string): Promise<void>;

  // --- Shell (capabilities.shell) ---
  executeShell(sessionId: string, command: string, model?: ModelRef): Promise<void>;

  // --- Providers & models (capabilities.multiProvider) ---
  getProviders(): Promise<{
    providers: ProviderInfo[];
    default: Record<string, string>;
  }>;
  listAllProviders(): Promise<AllProvidersData>;

  // --- Agent list (capabilities.subAgent) ---
  getAgents(): Promise<AgentInfo[]>;
  getChildSessions(sessionId: string): Promise<ChatSession[]>;

  // --- Permissions (capabilities.permission) ---
  replyPermission(sessionId: string, permissionId: string, response: PermissionResponse): Promise<void>;

  // --- Questions (capabilities.question) ---
  replyQuestion(requestId: string, answers: QuestionAnswer[]): Promise<void>;
  rejectQuestion(requestId: string): Promise<void>;

  // --- Session metadata (capabilities-dependent) ---
  getSessionDiff(sessionId: string): Promise<FileDiff[]>;
  getSessionTodos(sessionId: string): Promise<TodoItem[]>;

  // --- Config (capabilities.config) ---
  getConfig(): Promise<AppConfig>;
  updateConfig(config: Partial<AppConfig>): Promise<void>;
  getPath(): Promise<AppPaths>;

  // --- MCP (capabilities.mcp) ---
  getMcpStatus(): Promise<McpStatus>;
  connectMcp(server: string): Promise<void>;
  disconnectMcp(server: string): Promise<void>;

  // --- Tools ---
  getToolIds(): Promise<ToolListItem[]>;

  // --- Server URL (agent-specific, for terminal attachment etc.) ---
  getServerUrl(): string | undefined;

  // --- Model management ---
  setModel?(model: string): Promise<void>;
}
