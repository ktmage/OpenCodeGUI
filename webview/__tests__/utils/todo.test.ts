import { describe, expect, it } from "vitest";
import { type TodoItem, parseTodos } from "../../utils/todo";

describe("parseTodos", () => {
  // when given a valid JSON string
  context("有効な JSON 文字列の場合", () => {
    it("TodoItem 配列を返すこと", () => {
      const json = JSON.stringify([{ content: "task1" }, { content: "task2", status: "done" }]);
      const result = parseTodos(json);
      expect(result).toEqual([{ content: "task1" }, { content: "task2", status: "done" }]);
    });
  });

  // when given an object array directly
  context("オブジェクト配列を直接渡した場合", () => {
    it("TodoItem 配列を返すこと", () => {
      const arr = [{ content: "task1", priority: "high" }];
      expect(parseTodos(arr)).toEqual(arr);
    });
  });

  // when given a wrapper object with "todos" key
  context("todos キーを持つラッパーオブジェクトの場合", () => {
    it("todos 配列を返すこと", () => {
      const data = { todos: [{ content: "a" }] };
      expect(parseTodos(data)).toEqual([{ content: "a" }]);
    });
  });

  // when given a wrapper object with "items" key
  context("items キーを持つラッパーオブジェクトの場合", () => {
    it("items 配列を返すこと", () => {
      const data = { items: [{ content: "b" }] };
      expect(parseTodos(data)).toEqual([{ content: "b" }]);
    });
  });

  // when given an empty array
  context("空配列の場合", () => {
    it("null を返すこと", () => {
      expect(parseTodos([])).toBeNull();
    });
  });

  // when given items without "content" property
  context("content プロパティを持たないアイテムの場合", () => {
    it("null を返すこと", () => {
      expect(parseTodos([{ title: "no content" }])).toBeNull();
    });
  });

  // when given invalid JSON string
  context("不正な JSON 文字列の場合", () => {
    it("null を返すこと", () => {
      expect(parseTodos("{invalid")).toBeNull();
    });
  });

  // when given null
  context("null の場合", () => {
    it("null を返すこと", () => {
      expect(parseTodos(null)).toBeNull();
    });
  });

  // when given a number
  context("数値の場合", () => {
    it("null を返すこと", () => {
      expect(parseTodos(42)).toBeNull();
    });
  });
});
