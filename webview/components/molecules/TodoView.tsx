import { useLocale } from "../../locales";
import type { TodoItem } from "../../utils/todo";
import { StatusItem } from "../atoms/StatusItem";
import type { BadgeVariant } from "../atoms/StatusItem";
import styles from "./TodoView.module.css";

type Props = {
  todos: TodoItem[];
};

export function TodoView({ todos }: Props) {
  const t = useLocale();
  const completed = todos.filter((td) => td.status === "completed" || td.status === "done").length;
  const total = todos.length;

  return (
    <div className={styles.root}>
      <div className={styles.summary}>{t["tool.completed"](completed, total)}</div>
      <ul className={styles.list}>
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
    </div>
  );
}
