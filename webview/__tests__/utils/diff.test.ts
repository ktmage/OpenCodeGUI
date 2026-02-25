import { describe, expect, it } from "vitest";
import { type DiffLine, computeLineDiff } from "../../utils/diff";

describe("computeLineDiff", () => {
  // when both strings are identical
  context("同一文字列の場合", () => {
    it("変更行を含まないこと", () => {
      const result = computeLineDiff("hello\nworld", "hello\nworld");
      expect(result.every((l) => l.type === "context")).toBe(true);
    });
  });

  // when a line is added
  context("行が追加された場合", () => {
    it("add タイプの行を含むこと", () => {
      const result = computeLineDiff("a", "a\nb");
      expect(result.some((l) => l.type === "add" && l.text === "b")).toBe(true);
    });
  });

  // when a line is removed
  context("行が削除された場合", () => {
    it("remove タイプの行を含むこと", () => {
      const result = computeLineDiff("a\nb", "a");
      expect(result.some((l) => l.type === "remove" && l.text === "b")).toBe(true);
    });
  });

  // when a line is changed
  context("行が変更された場合", () => {
    it("remove タイプの行を含むこと", () => {
      const result = computeLineDiff("hello", "world");
      expect(result.some((l) => l.type === "remove")).toBe(true);
    });

    it("add タイプの行を含むこと", () => {
      const result = computeLineDiff("hello", "world");
      expect(result.some((l) => l.type === "add")).toBe(true);
    });
  });

  // when context lines are near changes
  context("変更行の近くにコンテキスト行がある場合", () => {
    it("変更行の前後2行以内のコンテキスト行を含むこと", () => {
      const old = "1\n2\n3\n4\n5";
      const new_ = "1\n2\nX\n4\n5";
      const result = computeLineDiff(old, new_);
      const contextLines = result.filter((l) => l.type === "context");
      expect(contextLines.length).toBeGreaterThan(0);
    });
  });

  // when context lines are far from changes
  context("変更行から離れたコンテキスト行がある場合", () => {
    it("遠いコンテキスト行を除外すること", () => {
      const lines = Array.from({ length: 20 }, (_, i) => String(i));
      const oldStr = lines.join("\n");
      const newLines = [...lines];
      newLines[0] = "changed";
      const newStr = newLines.join("\n");
      const result = computeLineDiff(oldStr, newStr);
      // line "10" is far from the change at index 0
      expect(result.some((l) => l.type === "context" && l.text === "10")).toBe(false);
    });
  });

  // when input exceeds 500 lines
  context("入力が500行を超える場合", () => {
    it("全行を remove/add としてフォールバックすること", () => {
      const oldStr = Array.from({ length: 501 }, (_, i) => `old${i}`).join("\n");
      const newStr = Array.from({ length: 501 }, (_, i) => `new${i}`).join("\n");
      const result = computeLineDiff(oldStr, newStr);
      const removes = result.filter((l) => l.type === "remove");
      const adds = result.filter((l) => l.type === "add");
      expect(removes.length + adds.length).toBe(1002);
    });
  });

  // when one string is empty
  context("片方が空文字列の場合", () => {
    it("空→テキストの場合、新しい行が add として含まれること", () => {
      const result = computeLineDiff("", "a\nb");
      expect(result.some((l) => l.type === "add" && l.text === "a")).toBe(true);
    });

    it("テキスト→空の場合、元の行が remove として含まれること", () => {
      const result = computeLineDiff("a\nb", "");
      expect(result.some((l) => l.type === "remove" && l.text === "a")).toBe(true);
    });
  });
});
