import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodoView } from "../../../components/molecules/TodoView";
import type { TodoItem } from "../../../utils/todo";

const sampleTodos: TodoItem[] = [
  { content: "Task 1", status: "completed", priority: undefined },
  { content: "Task 2", status: "in_progress", priority: "high" },
  { content: "Task 3", status: "pending", priority: "low" },
];

describe("TodoView", () => {
  // when todos are provided
  context("todo リストがある場合", () => {
    // renders all todo items
    it("全ての todo アイテムをレンダリングすること", () => {
      const { container } = render(<TodoView todos={sampleTodos} />);
      expect(container.querySelectorAll(".tool-todo-item")).toHaveLength(3);
    });

    // shows completion summary
    it("完了数サマリーを表示すること", () => {
      const { container } = render(<TodoView todos={sampleTodos} />);
      expect(container.querySelector(".tool-todo-summary")).toBeInTheDocument();
    });

    // marks completed items with check mark
    it("完了アイテムにチェックマークを表示すること", () => {
      const { container } = render(<TodoView todos={sampleTodos} />);
      const checks = container.querySelectorAll(".tool-todo-check");
      expect(checks[0]?.textContent).toBe("✓");
    });

    // marks incomplete items with circle
    it("未完了アイテムに丸を表示すること", () => {
      const { container } = render(<TodoView todos={sampleTodos} />);
      const checks = container.querySelectorAll(".tool-todo-check");
      expect(checks[1]?.textContent).toBe("○");
    });
  });

  // when a todo has priority
  context("todo に priority がある場合", () => {
    // renders priority badge
    it("priority バッジを表示すること", () => {
      const { container } = render(<TodoView todos={sampleTodos} />);
      expect(container.querySelectorAll(".tool-todo-priority").length).toBeGreaterThan(0);
    });
  });

  // when todos list is empty
  context("todo リストが空の場合", () => {
    // renders no items
    it("アイテムをレンダリングしないこと", () => {
      const { container } = render(<TodoView todos={[]} />);
      expect(container.querySelectorAll(".tool-todo-item")).toHaveLength(0);
    });
  });
});
