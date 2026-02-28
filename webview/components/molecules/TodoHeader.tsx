import { useState } from "react";
import { useLocale } from "../../locales";
import type { TodoItem } from "../../utils/todo";
import { StatusItem } from "../atoms/StatusItem";
import type { BadgeVariant } from "../atoms/StatusItem";
import { CheckboxIcon, ChevronRightIcon } from "../atoms/icons";

type Props = {
  todos: TodoItem[];
};

export function TodoHeader({ todos }: Props) {
  const t = useLocale();
  const [expanded, setExpanded] = useState(false);

  const completed = todos.filter((t) => t.status === "completed" || t.status === "done").length;
  const total = todos.length;

  return (
    <div className="todo-header">
      <div className="todo-header-bar" onClick={() => setExpanded((s) => !s)} title={t["todo.toggleList"]}>
        <CheckboxIcon className="todo-header-icon" />
        <span className="todo-header-label">{t["todo.label"]}</span>
        <span className="todo-header-count">
          {completed}/{total}
        </span>
        <span className="todo-header-progress">
          <span
            className="todo-header-progress-fill"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </span>
        <span className={`todo-header-chevron ${expanded ? "expanded" : ""}`}>
          <ChevronRightIcon />
        </span>
      </div>
      {expanded && (
        <ul className="todo-header-list">
          {todos.map((todo, i) => {
            const isDone = todo.status === "completed" || todo.status === "done";
            const badge = todo.priority
              ? { label: todo.priority, variant: (todo.priority === "high" ? "danger" : "muted") as BadgeVariant }
              : undefined;
            return (
              <StatusItem key={i} indicator={isDone ? "✓" : "○"} content={todo.content} isDone={isDone} badge={badge} />
            );
          })}
        </ul>
      )}
    </div>
  );
}
