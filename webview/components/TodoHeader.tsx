import { useState } from "react";
import type { TodoItem } from "./ToolPartView";

type Props = {
  todos: TodoItem[];
};

export function TodoHeader({ todos }: Props) {
  const [expanded, setExpanded] = useState(false);

  const completed = todos.filter((t) => t.status === "completed" || t.status === "done").length;
  const total = todos.length;

  return (
    <div className="todo-header">
      <div className="todo-header-bar" onClick={() => setExpanded((s) => !s)}>
        <svg className="todo-header-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2zm0 1a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9zM6.5 6L5 7.5 7 9.5l4-4L9.5 4 7 6.5 6.5 6z" />
        </svg>
        <span className="todo-header-label">
          To Do
        </span>
        <span className="todo-header-count">{completed}/{total}</span>
        <span className="todo-header-progress">
          <span
            className="todo-header-progress-fill"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          />
        </span>
        <span className={`todo-header-chevron ${expanded ? "expanded" : ""}`}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5.3 5.3-5.3 5.4z" />
          </svg>
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
                {todo.priority && (
                  <span className={`todo-header-item-priority ${priorityClass}`}>{todo.priority}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
