/**
 * @opencodegui/agent-opencode - SDK→Domain Type Mappers
 *
 * Converts types from @opencode-ai/sdk to @opencodegui/core domain types.
 * Each mapper is a pure function with no side effects.
 */

import type {
  Agent,
  Config,
  Event,
  Message,
  Part,
  Provider,
  FileDiff as SdkFileDiff,
  McpStatus as SdkMcpStatus,
  Path as SdkPath,
  Session,
  Todo,
} from "@opencode-ai/sdk";

import type {
  AgentEvent,
  AgentInfo,
  AllProvidersData,
  AppConfig,
  AppPaths,
  ChatMessage,
  ChatMessageWithParts,
  ChatSession,
  FileDiff,
  McpStatus,
  MessagePart,
  ProviderInfo,
  TodoItem,
  ToolListItem,
} from "@opencodegui/core";

// ============================================================
// Session
// ============================================================

export function mapSession(session: Session): ChatSession {
  // SDK Session type is structurally compatible — pass through
  return session as unknown as ChatSession;
}

export function mapSessions(sessions: Session[]): ChatSession[] {
  return sessions.map(mapSession);
}

// ============================================================
// Message + Parts
// ============================================================

export function mapMessage(message: Message): ChatMessage {
  return message as unknown as ChatMessage;
}

export function mapPart(part: Part): MessagePart {
  return part as unknown as MessagePart;
}

export function mapMessageWithParts(data: { info: Message; parts: Part[] }): ChatMessageWithParts {
  return {
    info: mapMessage(data.info),
    parts: data.parts.map(mapPart),
  };
}

export function mapMessagesWithParts(data: Array<{ info: Message; parts: Part[] }>): ChatMessageWithParts[] {
  return data.map(mapMessageWithParts);
}

// ============================================================
// Event
// ============================================================

export function mapEvent(event: Event): AgentEvent {
  // SDK Event is a discriminated union structurally compatible with AgentEvent
  return event as unknown as AgentEvent;
}

// ============================================================
// Provider
// ============================================================

export function mapProvider(provider: Provider): ProviderInfo {
  return provider as unknown as ProviderInfo;
}

export function mapProviders(providers: Provider[]): ProviderInfo[] {
  return providers.map(mapProvider);
}

// ============================================================
// FileDiff
// ============================================================

export function mapFileDiff(diff: SdkFileDiff): FileDiff {
  return diff as unknown as FileDiff;
}

export function mapFileDiffs(diffs: SdkFileDiff[]): FileDiff[] {
  return diffs.map(mapFileDiff);
}

// ============================================================
// Todo
// ============================================================

export function mapTodo(todo: Todo): TodoItem {
  return todo as unknown as TodoItem;
}

export function mapTodos(todos: Todo[]): TodoItem[] {
  return todos.map(mapTodo);
}

// ============================================================
// Agent
// ============================================================

export function mapAgent(agent: Agent): AgentInfo {
  return agent as unknown as AgentInfo;
}

export function mapAgents(agents: Agent[]): AgentInfo[] {
  return agents.map(mapAgent);
}

// ============================================================
// Config
// ============================================================

export function mapConfig(config: Config): AppConfig {
  return config as unknown as AppConfig;
}

// ============================================================
// Path
// ============================================================

export function mapPath(sdkPath: SdkPath): AppPaths {
  return sdkPath as unknown as AppPaths;
}

// ============================================================
// MCP Status
// ============================================================

export function mapMcpStatus(status: Record<string, SdkMcpStatus>): McpStatus {
  return status as unknown as McpStatus;
}

// ============================================================
// Tool IDs
// ============================================================

/**
 * SDK's tool.ids() returns string[], but IAgent.getToolIds() returns ToolListItem[].
 * Wrap each string ID into a ToolListItem.
 */
export function mapToolIds(ids: string[]): ToolListItem[] {
  return ids.map((id) => ({ id }));
}

// ============================================================
// AllProvidersData
// ============================================================

export function mapAllProvidersData(data: {
  all: Array<unknown>;
  default: Record<string, string>;
  connected: string[];
}): AllProvidersData {
  return data as unknown as AllProvidersData;
}
