import type { ToolPart } from "@opencodegui/core";
import { useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../../contexts/AppContext";
import { useLocale } from "../../../locales";
import { getFileIcon } from "../../../utils/file-icons";
import { parseTodos } from "../../../utils/todo";
import { CATEGORY_LABEL_KEYS, getCategory, type ToolCategory } from "../../../utils/tool-categories";
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
} from "../../atoms/icons";
import { DiffView } from "../../molecules/DiffView";
import { FileCreateView } from "../../molecules/FileCreateView";
import { TodoView } from "../../molecules/TodoView";
import styles from "./ToolPartView.module.css";

type Props = {
  part: ToolPart;
};

/** タイトル（ファイルパスなど）をフォーマット */
function formatTitle(part: ToolPart): string | null {
  const { state } = part;
  const title = state.status === "completed" ? state.title : state.status === "running" ? state.title : null;
  return title ?? null;
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

export function ToolPartView({ part }: Props) {
  const t = useLocale();
  const { onOpenFile } = useAppContext();
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

  // タイトルからファイルパスを抽出する（絶対パスの場合のみリンク化対象）
  const titleFilePath = useMemo(() => {
    // input にファイルパスがあればそれを使う
    if (input) {
      const fp = getFilePath(input);
      if (fp?.startsWith("/")) return fp;
    }
    // タイトル自体が絶対パスの場合
    if (title?.startsWith("/")) return title;
    return null;
  }, [input, title]);

  const handleTitleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!titleFilePath) return;
      e.stopPropagation();
      onOpenFile(titleFilePath);
    },
    [titleFilePath, onOpenFile],
  );

  const statusClass: Record<string, string> = {
    running: styles.running,
    pending: styles.pending,
    completed: styles.completed,
    error: styles.error,
  };

  const actionClass: Record<string, string> = {
    read: styles.actionRead,
    edit: styles.actionEdit,
    write: styles.actionWrite,
    run: styles.actionRun,
    search: styles.actionSearch,
    other: styles.actionOther,
  };

  return (
    <div className={`${styles.root} ${statusClass[state.status] ?? ""}`}>
      <div className={styles.header} onClick={() => setExpanded((s) => !s)} title={t["tool.toggleDetails"]}>
        <span className={styles.icon}>
          {isActive ? (
            <SpinnerIcon className={styles.spinner} />
          ) : isError ? (
            <ErrorCircleIcon />
          ) : (
            <ActionIcon category={category} />
          )}
        </span>
        <span className={`${styles.action} ${actionClass[category] ?? ""}`}>{actionLabel}</span>
        {displayTitle && (
          <span className={styles.title} title={displayTitle}>
            {titleFilePath ? (
              // biome-ignore lint/a11y/useKeyWithClickEvents: ツールタイトルのファイルパスリンク
              // biome-ignore lint/a11y/noStaticElementInteractions: ツールタイトルのファイルパスリンク
              <span className={styles.fileChip} onClick={handleTitleClick}>
                {(() => {
                  const fileName = titleFilePath.split("/").pop() || titleFilePath;
                  const FileTypeIcon = getFileIcon(fileName);
                  return <FileTypeIcon width={14} height={14} className={styles.fileChipIcon} />;
                })()}
                <span className={styles.fileChipLabel}>{displayTitle}</span>
              </span>
            ) : (
              displayTitle
            )}
          </span>
        )}
        <span className={`${styles.chevron} ${expanded ? styles.expanded : ""}`}>
          <ChevronRightIcon />
        </span>
      </div>
      {expanded && (
        <div className={styles.body}>
          {todos ? (
            <TodoView todos={todos} />
          ) : isEdit && input ? (
            <DiffView oldStr={input.oldString as string} newStr={input.newString as string} />
          ) : isCreate && input ? (
            <FileCreateView content={input.content as string} />
          ) : (
            <>
              {isCompleted && state.output && <pre className={styles.output}>{state.output}</pre>}
              {isError && <pre className={`${styles.output} ${styles.outputError}`}>{state.error}</pre>}
              {isActive && input && <pre className={styles.output}>{JSON.stringify(input, null, 2)}</pre>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
