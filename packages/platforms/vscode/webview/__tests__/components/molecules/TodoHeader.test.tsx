import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodoHeader } from "../../../components/molecules/TodoHeader";
import type { TodoItem } from "../../../utils/todo";

const sampleTodos: TodoItem[] = [
  { content: "Task 1", status: "completed", priority: undefined },
  { content: "Task 2", status: "in_progress", priority: "high" },
  { content: "Task 3", status: "pending", priority: undefined },
];

describe("TodoHeader", () => {
  // when rendered
  context("レンダリングした場合", () => {
    // renders the header bar
    it("ヘッダーバーをレンダリングすること", () => {
      const { container } = render(<TodoHeader todos={sampleTodos} />);
      expect(container.querySelector(".bar")).toBeInTheDocument();
    });

    // shows completion count
    it("完了数を表示すること", () => {
      const { container } = render(<TodoHeader todos={sampleTodos} />);
      expect(container.querySelector(".count")?.textContent).toBe("1/3");
    });

    // renders progress bar
    it("プログレスバーをレンダリングすること", () => {
      const { container } = render(<TodoHeader todos={sampleTodos} />);
      expect(container.querySelector(".progress")).toBeInTheDocument();
    });
  });

  // when header is clicked
  context("ヘッダーをクリックした場合", () => {
    // expands the todo list
    it("todo リストを展開すること", () => {
      const { container } = render(<TodoHeader todos={sampleTodos} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelector(".list")).toBeInTheDocument();
    });

    // shows all todo items
    it("全ての todo アイテムを表示すること", () => {
      const { container } = render(<TodoHeader todos={sampleTodos} />);
      fireEvent.click(container.querySelector(".bar")!);
      expect(container.querySelectorAll("li")).toHaveLength(3);
    });
  });

  // when all todos are completed
  context("全 todo が完了している場合", () => {
    // shows full completion count
    it("全完了数を表示すること", () => {
      const allDone: TodoItem[] = [
        { content: "Done 1", status: "completed", priority: undefined },
        { content: "Done 2", status: "done", priority: undefined },
      ];
      const { container } = render(<TodoHeader todos={allDone} />);
      expect(container.querySelector(".count")?.textContent).toBe("2/2");
    });
  });
});
