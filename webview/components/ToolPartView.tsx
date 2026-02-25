import type { ToolPart } from "@opencode-ai/sdk";
import { useMemo, useState } from "react";
import { useLocale } from "../locales";
import type { TodoItem } from "../utils/todo";
import { parseTodos } from "../utils/todo";
import { CATEGORY_LABEL_KEYS, getCategory } from "../utils/tool-categories";
import { computeLineDiff } from "../utils/diff";
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
