import { useState } from "react";
import { useLocale } from "../../../locales";
import type { TodoItem } from "../../../utils/todo";
import { CheckboxIcon, ChevronRightIcon } from "../../atoms/icons";
import type { BadgeVariant } from "../../atoms/StatusItem";
import { StatusItem } from "../../atoms/StatusItem";
import styles from "./TodoHeader.module.css";

type Props = {
  todos: TodoItem[];
};

export function TodoHeader({ todos }: Props) {
  const t = useLocale();
  const [expanded, setExpanded] = useState(false);

  const completed = todos.filter((t) => t.status === "completed" || t.status === "done").length;
  const total = todos.length;

  return (
    <div className={styles.root}>
      <div className={styles.bar} onClick={() => setExpanded((s) => !s)} title={t["todo.toggleList"]}>
        <CheckboxIcon className={styles.icon} />
        <span className={styles.label}>{t["todo.label"]}</span>
        <span className={styles.count}>
          {completed}/{total}
        </span>
        <span className={styles.progress}>
          <span className={styles.progressFill} style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }} />
        </span>
        <span className={`${styles.chevron} ${expanded ? styles.expanded : ""}`}>
          <ChevronRightIcon />
        </span>
      </div>
      {expanded && (
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
      )}
    </div>
  );
}
