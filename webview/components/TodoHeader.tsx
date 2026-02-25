import { useState } from "react";
import { useLocale } from "../locales";
import type { TodoItem } from "../utils/todo";
import { CheckboxIcon, ChevronRightIcon } from "./atoms/icons";

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
            const priorityClass = todo.priority === "high" ? "high" : todo.priority === "low" ? "low" : "";
            return (
              <li key={i} className={`todo-header-item ${isDone ? "done" : ""}`}>
                <span className="todo-header-item-check">{isDone ? "✓" : "○"}</span>
                <span className="todo-header-item-content">{todo.content}</span>
                {todo.priority && <span className={`todo-header-item-priority ${priorityClass}`}>{todo.priority}</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
