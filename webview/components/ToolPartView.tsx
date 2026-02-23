import { useState, useMemo } from "react";
import type { ToolPart } from "@opencode-ai/sdk";
import { useLocale } from "../locales";

type Props = {
  part: ToolPart;
};

// --- ツール種別からアクションラベルとアイコンを決定 ---

type ToolCategory = "read" | "edit" | "write" | "run" | "search" | "other";

const TOOL_CATEGORIES: Record<string, ToolCategory> = {
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

const CATEGORY_LABEL_KEYS: Record<ToolCategory, "tool.read" | "tool.edit" | "tool.create" | "tool.run" | "tool.search" | "tool.tool"> = {
  read: "tool.read",
  edit: "tool.edit",
  write: "tool.create",
  run: "tool.run",
  search: "tool.search",
  other: "tool.tool",
};

function getCategory(toolName: string): ToolCategory {
  // 完全一致
  if (TOOL_CATEGORIES[toolName]) return TOOL_CATEGORIES[toolName];
  // MCP ツールなど: プレフィクスを除去して再チェック
  const parts = toolName.split(/[_/]/);
  const last = parts[parts.length - 1];
  if (TOOL_CATEGORIES[last]) return TOOL_CATEGORIES[last];
  return "other";
}

/** タイトル（ファイルパスなど）をフォーマット */
function formatTitle(part: ToolPart): string | null {
  const { state, tool } = part;
  const title = state.status === "completed" ? state.title : (state.status === "running" ? state.title : null);
  if (!title) return null;
  // bash の場合はコマンド説明
  if (tool === "bash" || tool === "task") return title;
  return title;
}

/** ファイルパスの末尾ファイル名を取得 */
function basename(p: string): string {
  return p.split("/").pop() ?? p;
}

/** input からファイルパスを抽出 */
function getFilePath(input: Record<string, unknown>): string | null {
  const fp = input.filePath ?? input.file ?? input.path ?? input.filename;
  if (typeof fp === "string") return fp;
  return null;
}

function isFileEditInput(input: Record<string, unknown>): boolean {
  return typeof input.oldString === "string" && typeof input.newString === "string";
}

function isFileCreateInput(input: Record<string, unknown>): boolean {
  return typeof input.content === "string" && getFilePath(input) !== null && typeof input.oldString !== "string";
}

// --- Diff 計算 ---

type DiffLine = { type: "context" | "add" | "remove"; text: string };

function computeLineDiff(oldStr: string, newStr: string): DiffLine[] {
  const oldLines = oldStr.split("\n");
  const newLines = newStr.split("\n");
  const result: DiffLine[] = [];

  const n = oldLines.length;
  const m = newLines.length;
  if (n > 500 || m > 500) {
    for (const line of oldLines) result.push({ type: "remove", text: line });
    for (const line of newLines) result.push({ type: "add", text: line });
    return result;
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const raw: DiffLine[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      raw.push({ type: "context", text: oldLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.push({ type: "add", text: newLines[j - 1] });
      j--;
    } else {
      raw.push({ type: "remove", text: oldLines[i - 1] });
      i--;
    }
  }
  raw.reverse();

  const hasChange = (idx: number) => raw[idx]?.type !== "context";
  for (let k = 0; k < raw.length; k++) {
    if (raw[k].type !== "context") {
      result.push(raw[k]);
    } else {
      let nearChange = false;
      for (let d = -2; d <= 2; d++) {
        if (hasChange(k + d)) { nearChange = true; break; }
      }
      if (nearChange) result.push(raw[k]);
    }
  }

  return result;
}

// --- ToDo ---

export type TodoItem = { content: string; status?: string; priority?: string };

/** JSON文字列からToDoアイテムを抽出 */
export function parseTodos(raw: unknown): TodoItem[] | null {
  try {
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    const arr = Array.isArray(data) ? data : (data?.todos ?? data?.items ?? null);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    if (!arr.every((item: unknown) => typeof item === "object" && item !== null && "content" in item)) return null;
    return arr as TodoItem[];
  } catch {
    return null;
  }
}

function TodoView({ todos }: { todos: TodoItem[] }) {
  const t = useLocale();
  const completed = todos.filter((td) => td.status === "completed" || td.status === "done").length;
  const total = todos.length;

  return (
    <div className="tool-todo">
      <div className="tool-todo-summary">
        {t["tool.completed"](completed, total)}
      </div>
      <ul className="tool-todo-list">
        {todos.map((todo, i) => {
          const isDone = todo.status === "completed" || todo.status === "done";
          const priorityClass = todo.priority === "high" ? "high" : todo.priority === "low" ? "low" : "";
          return (
            <li key={i} className={`tool-todo-item ${isDone ? "done" : ""} ${priorityClass}`}>
              <span className="tool-todo-check">{isDone ? "✓" : "○"}</span>
              <span className="tool-todo-content">{todo.content}</span>
              {todo.priority && (
                <span className={`tool-todo-priority ${priorityClass}`}>{todo.priority}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// --- サブコンポーネント ---

function DiffView({ oldStr, newStr }: { oldStr: string; newStr: string }) {
  const lines = useMemo(() => computeLineDiff(oldStr, newStr), [oldStr, newStr]);
  const addCount = lines.filter((l) => l.type === "add").length;
  const removeCount = lines.filter((l) => l.type === "remove").length;

  return (
    <div className="tool-diff">
      <div className="tool-diff-stats">
        {addCount > 0 && <span className="tool-diff-stat-add">+{addCount}</span>}
        {removeCount > 0 && <span className="tool-diff-stat-remove">−{removeCount}</span>}
      </div>
      <div className="tool-diff-lines">
        {lines.map((line, i) => (
          <div key={i} className={`tool-diff-line tool-diff-line-${line.type}`}>
            <span className="tool-diff-line-marker">
              {line.type === "add" ? "+" : line.type === "remove" ? "−" : " "}
            </span>
            <span className="tool-diff-line-text">{line.text || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FileCreateView({ content }: { content: string }) {
  const t = useLocale();
  const lines = content.split("\n");
  const displayLines = lines.length > 30 ? [...lines.slice(0, 30), t["tool.moreLines"](lines.length - 30)] : lines;
  return (
    <div className="tool-diff">
      <div className="tool-diff-stats">
        <span className="tool-diff-stat-add">{t["tool.addLines"](lines.length)}</span>
      </div>
      <div className="tool-diff-lines">
        {displayLines.map((line, i) => (
          <div key={i} className="tool-diff-line tool-diff-line-add">
            <span className="tool-diff-line-marker">+</span>
            <span className="tool-diff-line-text">{line || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- アクションアイコン ---

function ActionIcon({ category }: { category: ToolCategory }) {
  switch (category) {
    case "read":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M1.5 1h11l1.5 2v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 0 13.5V2.5A1.5 1.5 0 0 1 1.5 1zm0 1a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V3.5L12 2H1.5zM3 5h8v1H3V5zm0 3h8v1H3V8zm0 3h5v1H3v-1z" />
        </svg>
      );
    case "edit":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z" />
        </svg>
      );
    case "write":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M9 1h4.5a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5V2.5A1.5 1.5 0 0 1 2.5 1H7v1H2.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V2.5a.5.5 0 0 0-.5-.5H9V1zM8 4l4 4H9v4H7V8H4l4-4z" />
        </svg>
      );
    case "run":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 2.5A1.5 1.5 0 0 1 3.5 1h9A1.5 1.5 0 0 1 14 2.5v11a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5v-11zM3.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-9zM5 6l4 2.5L5 11V6z" />
        </svg>
      );
    case "search":
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M15.25 11.8l-3.5-3.5a5.51 5.51 0 1 0-1.45 1.45l3.5 3.5a1.028 1.028 0 0 0 1.45-1.45zM6.5 10A3.5 3.5 0 1 1 10 6.5 3.504 3.504 0 0 1 6.5 10z" />
        </svg>
      );
    default:
      return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zM10 1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5h-3V1z" />
        </svg>
      );
  }
}

// --- メインコンポーネント ---

export function ToolPartView({ part }: Props) {
  const t = useLocale();
  const [expanded, setExpanded] = useState(false);
  const { state } = part;

  const isActive = state.status === "running" || state.status === "pending";
  const isCompleted = state.status === "completed";
  const isError = state.status === "error";

  const category = getCategory(part.tool);
  const actionLabel = t[CATEGORY_LABEL_KEYS[category]];
  const title = formatTitle(part);

  const input = (state.status !== "pending" ? state.input : null) as Record<string, unknown> | null;
  const isEdit = input ? isFileEditInput(input) : false;
  const isCreate = input ? isFileCreateInput(input) : false;

  // ToDo ツール判定 & パース
  const isTodoTool = part.tool === "todowrite" || part.tool === "todoread";
  const todos = useMemo(() => {
    if (!isTodoTool) return null;
    // outputから試す（todoread, todowrite完了後）
    if (isCompleted && state.output) {
      const fromOutput = parseTodos(state.output);
      if (fromOutput) return fromOutput;
    }
    // inputから試す（todowrite）
    if (input) {
      const fromInput = parseTodos(input.todos ?? input);
      if (fromInput) return fromInput;
    }
    return null;
  }, [isTodoTool, isCompleted, state, input]);

  // タイトル表示: todoツールの場合は件数を正しく表示
  const displayTitle = useMemo(() => {
    if (isTodoTool && todos) {
      const done = todos.filter((td) => td.status === "completed" || td.status === "done").length;
      return t["tool.todos"](done, todos.length);
    }
    return title;
  }, [isTodoTool, todos, title]);

  return (
    <div className={`tool-part ${state.status}`}>
      <div className="tool-part-header" onClick={() => setExpanded((s) => !s)}>
        <span className="tool-part-icon">
          {isActive ? (
            <svg className="tool-part-spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : isError ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
              <path d="M7.25 4h1.5v5h-1.5V4zm0 6h1.5v1.5h-1.5V10z" />
            </svg>
          ) : (
            <ActionIcon category={category} />
          )}
        </span>
        <span className={`tool-part-action tool-part-action-${category}`}>{actionLabel}</span>
        {displayTitle && <span className="tool-part-title" title={displayTitle}>{displayTitle}</span>}
        <span className={`tool-part-chevron ${expanded ? "expanded" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5.3 5.3-5.3 5.4z" />
          </svg>
        </span>
      </div>
      {expanded && (
        <div className="tool-part-body">
          {todos ? (
            <TodoView todos={todos} />
          ) : isEdit && input ? (
            <DiffView
              oldStr={input.oldString as string}
              newStr={input.newString as string}
            />
          ) : isCreate && input ? (
            <FileCreateView content={input.content as string} />
          ) : (
            <>
              {isCompleted && state.output && (
                <pre className="tool-part-output">{state.output}</pre>
              )}
              {isError && (
                <pre className="tool-part-output tool-part-error">{state.error}</pre>
              )}
              {isActive && input && (
                <pre className="tool-part-output">{JSON.stringify(input, null, 2)}</pre>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
