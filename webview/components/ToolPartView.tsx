import type { ToolPart } from "@opencode-ai/sdk";
import { useMemo, useState } from "react";
import { useLocale } from "../locales";
import {
  ChevronRightIcon,
  EditActionIcon,
  ErrorCircleIcon,
  ReadActionIcon,
  RunActionIcon,
  SearchActionIcon,
  SpinnerIcon,
  ToolIcon,
  WriteActionIcon,
} from "./atoms/icons";

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

const CATEGORY_LABEL_KEYS: Record<
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
  const title = state.status === "completed" ? state.title : state.status === "running" ? state.title : null;
  if (!title) return null;
  // bash の場合はコマンド説明
  if (tool === "bash" || tool === "task") return title;
  return title;
}

/** ファイルパスの末尾ファイル名を取得 */
function _basename(p: string): string {
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
  let i = n,
    j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      raw.push({ type: "context", text: oldLines[i - 1] });
      i--;
      j--;
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
        if (hasChange(k + d)) {
          nearChange = true;
          break;
        }
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
      <div className="tool-todo-summary">{t["tool.completed"](completed, total)}</div>
      <ul className="tool-todo-list">
        {todos.map((todo, i) => {
          const isDone = todo.status === "completed" || todo.status === "done";
          const priorityClass = todo.priority === "high" ? "high" : todo.priority === "low" ? "low" : "";
          return (
            <li key={i} className={`tool-todo-item ${isDone ? "done" : ""} ${priorityClass}`}>
              <span className="tool-todo-check">{isDone ? "✓" : "○"}</span>
              <span className="tool-todo-content">{todo.content}</span>
              {todo.priority && <span className={`tool-todo-priority ${priorityClass}`}>{todo.priority}</span>}
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
      return <ReadActionIcon />;
    case "edit":
      return <EditActionIcon />;
    case "write":
      return <WriteActionIcon />;
    case "run":
      return <RunActionIcon />;
    case "search":
      return <SearchActionIcon />;
    default:
      return <ToolIcon />;
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
  }, [isTodoTool, todos, title, t["tool.todos"]]);

  return (
    <div className={`tool-part ${state.status}`}>
      <div className="tool-part-header" onClick={() => setExpanded((s) => !s)} title={t["tool.toggleDetails"]}>
        <span className="tool-part-icon">
          {isActive ? (
            <SpinnerIcon className="tool-part-spinner" />
          ) : isError ? (
            <ErrorCircleIcon />
          ) : (
            <ActionIcon category={category} />
          )}
        </span>
        <span className={`tool-part-action tool-part-action-${category}`}>{actionLabel}</span>
        {displayTitle && (
          <span className="tool-part-title" title={displayTitle}>
            {displayTitle}
          </span>
        )}
        <span className={`tool-part-chevron ${expanded ? "expanded" : ""}`}>
          <ChevronRightIcon />
        </span>
      </div>
      {expanded && (
        <div className="tool-part-body">
          {todos ? (
            <TodoView todos={todos} />
          ) : isEdit && input ? (
            <DiffView oldStr={input.oldString as string} newStr={input.newString as string} />
          ) : isCreate && input ? (
            <FileCreateView content={input.content as string} />
          ) : (
            <>
              {isCompleted && state.output && <pre className="tool-part-output">{state.output}</pre>}
              {isError && <pre className="tool-part-output tool-part-error">{state.error}</pre>}
              {isActive && input && <pre className="tool-part-output">{JSON.stringify(input, null, 2)}</pre>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
