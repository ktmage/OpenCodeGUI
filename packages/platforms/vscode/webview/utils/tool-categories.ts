export type ToolCategory = "read" | "edit" | "write" | "run" | "search" | "other";

export const TOOL_CATEGORIES: Record<string, ToolCategory> = {
  read: "read",
  edit: "edit",
  multiedit: "edit",
  write: "write",
  apply_patch: "edit",
  bash: "run",
  glob: "search",
  grep: "search",
  list: "search",
  codesearch: "search",
  websearch: "search",
  webfetch: "read",
  lsp: "read",
  todowrite: "write",
  todoread: "read",
  task: "run",
  batch: "run",
  question: "other",
  skill: "run",
  plan_enter: "other",
  plan_exit: "other",
};

export const CATEGORY_LABEL_KEYS: Record<
  ToolCategory,
  "tool.read" | "tool.edit" | "tool.create" | "tool.run" | "tool.search" | "tool.tool"
> = {
  read: "tool.read",
  edit: "tool.edit",
  write: "tool.create",
  run: "tool.run",
  search: "tool.search",
  other: "tool.tool",
};

export function getCategory(toolName: string): ToolCategory {
  // exact match
  if (TOOL_CATEGORIES[toolName]) return TOOL_CATEGORIES[toolName];
  // MCP tools etc: strip prefix and re-check
  const parts = toolName.split(/[_/]/);
  const last = parts[parts.length - 1];
  if (TOOL_CATEGORIES[last]) return TOOL_CATEGORIES[last];
  return "other";
}
