import { useLocale } from "../../locales";
import type { TodoItem } from "../../utils/todo";

type Props = {
  todos: TodoItem[];
};

export function TodoView({ todos }: Props) {
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
