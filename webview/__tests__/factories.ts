import type { Event, Message, Permission, Provider, Session, TextPart, ToolPart } from "@opencode-ai/sdk";

// --- Session ---

let sessionSeq = 0;

export function createSession(overrides: Partial<Session> = {}): Session {
  const id = `session-${++sessionSeq}`;
  return {
    id,
    title: `Session ${sessionSeq}`,
    time: {
      created: Date.now(),
      updated: Date.now(),
    },
    ...overrides,
  } as Session;
}

// --- Message ---

let messageSeq = 0;

export function createMessage(overrides: Partial<Message> = {}): Message {
  const id = `msg-${++messageSeq}`;
  return {
    id,
    sessionID: "session-1",
    role: "assistant",
    time: { created: Date.now(), updated: Date.now() },
    ...overrides,
  } as Message;
}

// --- Part ---

let partSeq = 0;

export function createTextPart(text: string, overrides: Partial<TextPart> = {}): TextPart {
  return {
    id: `part-${++partSeq}`,
    type: "text",
    text,
    messageID: "msg-1",
    time: { created: Date.now(), updated: Date.now() },
    ...overrides,
  } as TextPart;
}

export function createToolPart(tool: string, overrides: Partial<ToolPart> = {}): ToolPart {
  return {
    id: `part-${++partSeq}`,
    type: "tool",
    tool,
    messageID: "msg-1",
    time: { created: Date.now(), updated: Date.now() },
    state: { status: "completed", title: tool, input: {}, output: "ok" },
    ...overrides,
  } as unknown as ToolPart;
}

// --- Permission ---

export function createPermission(overrides: Partial<Permission> = {}): Permission {
  return {
    id: `perm-${++partSeq}`,
    title: "Allow file write?",
    messageID: "msg-1",
    sessionID: "session-1",
    ...overrides,
  } as Permission;
}

// --- Provider ---

export function createProvider(
  id: string,
  models: Record<
    string,
    { id: string; name: string; limit?: { context: number; output: number }; status?: string }
  > = {},
): Provider {
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    models,
  } as unknown as Provider;
}

// --- Event ---

export function createEvent(type: string, properties: Record<string, unknown> = {}): Event {
  return { type, properties } as unknown as Event;
}

// --- AllProvidersData ---

export function createAllProvidersData(
  connected: string[] = [],
  all: Array<{ id: string; name: string; models: Record<string, unknown> }> = [],
  defaultModel: Record<string, string> = {},
) {
  return {
    connected,
    all: all.map((p) => ({
      ...p,
      env: [],
    })),
    default: defaultModel,
  };
}
