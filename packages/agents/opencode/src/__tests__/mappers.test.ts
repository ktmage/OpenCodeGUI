/**
 * mappers.ts のユニットテスト。
 * 各 mapper 関数が SDK 型からドメイン型に正しく変換することを検証する。
 */
import { describe, expect, it } from "vitest";
import {
  mapAgent,
  mapAgents,
  mapAllProvidersData,
  mapConfig,
  mapEvent,
  mapFileDiff,
  mapFileDiffs,
  mapMcpStatus,
  mapMessage,
  mapMessagesWithParts,
  mapMessageWithParts,
  mapPart,
  mapPath,
  mapProvider,
  mapProviders,
  mapSession,
  mapSessions,
  mapTodo,
  mapTodos,
  mapToolIds,
} from "../mappers";

// ============================================================
// Session mappers
// ============================================================

describe("mapSession", () => {
  it("should pass through session data as ChatSession", () => {
    const sdkSession = {
      id: "sess-1",
      title: "Test Session",
      createdAt: 1700000000,
      updatedAt: 1700001000,
    };
    const result = mapSession(sdkSession as never);
    expect(result).toEqual(sdkSession);
  });
});

describe("mapSessions", () => {
  it("should map an array of sessions", () => {
    const sessions = [
      { id: "s1", title: "Session 1" },
      { id: "s2", title: "Session 2" },
    ];
    const result = mapSessions(sessions as never);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(sessions[0]);
    expect(result[1]).toEqual(sessions[1]);
  });

  it("should return empty array for empty input", () => {
    expect(mapSessions([])).toEqual([]);
  });
});

// ============================================================
// Message + Parts mappers
// ============================================================

describe("mapMessage", () => {
  it("should pass through message data as ChatMessage", () => {
    const sdkMessage = {
      id: "msg-1",
      role: "assistant",
      content: "Hello",
      createdAt: 1700000000,
    };
    const result = mapMessage(sdkMessage as never);
    expect(result).toEqual(sdkMessage);
  });
});

describe("mapPart", () => {
  it("should pass through text part", () => {
    const part = { type: "text", content: "Hello world" };
    const result = mapPart(part as never);
    expect(result).toEqual(part);
  });

  it("should pass through tool-use part", () => {
    const part = { type: "tool-use", toolName: "search", input: { query: "foo" } };
    const result = mapPart(part as never);
    expect(result).toEqual(part);
  });
});

describe("mapMessageWithParts", () => {
  it("should map info and parts together", () => {
    const data = {
      info: { id: "msg-1", role: "assistant" },
      parts: [
        { type: "text", content: "Hello" },
        { type: "tool-use", toolName: "search" },
      ],
    };
    const result = mapMessageWithParts(data as never);
    expect(result.info).toEqual(data.info);
    expect(result.parts).toHaveLength(2);
    expect(result.parts[0]).toEqual(data.parts[0]);
    expect(result.parts[1]).toEqual(data.parts[1]);
  });
});

describe("mapMessagesWithParts", () => {
  it("should map an array of messages with parts", () => {
    const data = [
      { info: { id: "msg-1" }, parts: [{ type: "text" }] },
      { info: { id: "msg-2" }, parts: [] },
    ];
    const result = mapMessagesWithParts(data as never);
    expect(result).toHaveLength(2);
    expect(result[0].info).toEqual(data[0].info);
    expect(result[1].parts).toEqual([]);
  });
});

// ============================================================
// Event mapper
// ============================================================

describe("mapEvent", () => {
  it("should pass through session.updated event", () => {
    const event = { type: "session.updated", properties: { id: "sess-1" } };
    const result = mapEvent(event as never);
    expect(result).toEqual(event);
  });

  it("should pass through message.created event", () => {
    const event = { type: "message.created", properties: { sessionID: "sess-1", id: "msg-1" } };
    const result = mapEvent(event as never);
    expect(result).toEqual(event);
  });
});

// ============================================================
// Provider mapper
// ============================================================

describe("mapProvider", () => {
  it("should pass through provider data as ProviderInfo", () => {
    const provider = { id: "anthropic", name: "Anthropic", models: [] };
    const result = mapProvider(provider as never);
    expect(result).toEqual(provider);
  });
});

describe("mapProviders", () => {
  it("should map an array of providers", () => {
    const providers = [
      { id: "p1", name: "Provider 1" },
      { id: "p2", name: "Provider 2" },
    ];
    const result = mapProviders(providers as never);
    expect(result).toHaveLength(2);
  });
});

// ============================================================
// FileDiff mapper
// ============================================================

describe("mapFileDiff", () => {
  it("should pass through file diff data", () => {
    const diff = { path: "src/index.ts", before: "old", after: "new" };
    const result = mapFileDiff(diff as never);
    expect(result).toEqual(diff);
  });
});

describe("mapFileDiffs", () => {
  it("should map an array of file diffs", () => {
    const diffs = [
      { path: "a.ts", before: "", after: "new" },
      { path: "b.ts", before: "old", after: "" },
    ];
    const result = mapFileDiffs(diffs as never);
    expect(result).toHaveLength(2);
  });

  it("should return empty array for empty input", () => {
    expect(mapFileDiffs([])).toEqual([]);
  });
});

// ============================================================
// Todo mapper
// ============================================================

describe("mapTodo", () => {
  it("should pass through todo data as TodoItem", () => {
    const todo = { id: "t1", text: "Fix bug", done: false };
    const result = mapTodo(todo as never);
    expect(result).toEqual(todo);
  });
});

describe("mapTodos", () => {
  it("should map an array of todos", () => {
    const todos = [
      { id: "t1", text: "A" },
      { id: "t2", text: "B" },
    ];
    const result = mapTodos(todos as never);
    expect(result).toHaveLength(2);
  });
});

// ============================================================
// Agent mapper
// ============================================================

describe("mapAgent", () => {
  it("should pass through agent data as AgentInfo", () => {
    const agentData = { id: "agent-1", name: "Default Agent" };
    const result = mapAgent(agentData as never);
    expect(result).toEqual(agentData);
  });
});

describe("mapAgents", () => {
  it("should map an array of agents", () => {
    const agents = [{ id: "a1" }, { id: "a2" }];
    const result = mapAgents(agents as never);
    expect(result).toHaveLength(2);
  });
});

// ============================================================
// Config mapper
// ============================================================

describe("mapConfig", () => {
  it("should pass through config data as AppConfig", () => {
    const config = { model: "claude-4", theme: "dark" };
    const result = mapConfig(config as never);
    expect(result).toEqual(config);
  });
});

// ============================================================
// Path mapper
// ============================================================

describe("mapPath", () => {
  it("should pass through path data as AppPaths", () => {
    const pathData = {
      config: "/home/.config/opencode",
      data: "/home/.local/share/opencode",
      home: "/home/user",
    };
    const result = mapPath(pathData as never);
    expect(result).toEqual(pathData);
  });

  it("should handle path without home field", () => {
    const pathData = {
      config: "/home/.config/opencode",
      data: "/home/.local/share/opencode",
    };
    const result = mapPath(pathData as never);
    expect(result).toEqual(pathData);
  });
});

// ============================================================
// MCP Status mapper
// ============================================================

describe("mapMcpStatus", () => {
  it("should pass through MCP status data", () => {
    const status = {
      "server-1": { connected: true, tools: ["tool-a"] },
      "server-2": { connected: false, tools: [] },
    };
    const result = mapMcpStatus(status as never);
    expect(result).toEqual(status);
  });

  it("should handle empty status", () => {
    const result = mapMcpStatus({} as never);
    expect(result).toEqual({});
  });
});

// ============================================================
// Tool IDs mapper
// ============================================================

describe("mapToolIds", () => {
  it("should wrap each string ID into ToolListItem", () => {
    const ids = ["tool-1", "tool-2", "tool-3"];
    const result = mapToolIds(ids);
    expect(result).toEqual([{ id: "tool-1" }, { id: "tool-2" }, { id: "tool-3" }]);
  });

  it("should return empty array for empty input", () => {
    expect(mapToolIds([])).toEqual([]);
  });

  it("should handle single ID", () => {
    expect(mapToolIds(["only-one"])).toEqual([{ id: "only-one" }]);
  });
});

// ============================================================
// AllProvidersData mapper
// ============================================================

describe("mapAllProvidersData", () => {
  it("should pass through all providers data", () => {
    const data = {
      all: [{ id: "p1", name: "Provider 1", models: [] }],
      default: { chat: "anthropic/claude-4" },
      connected: ["p1"],
    };
    const result = mapAllProvidersData(data as never);
    expect(result).toEqual(data);
  });

  it("should handle empty data", () => {
    const data = { all: [], default: {}, connected: [] };
    const result = mapAllProvidersData(data);
    expect(result).toEqual(data);
  });
});
