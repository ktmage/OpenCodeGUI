import { describe, expect, it } from "vitest";
import { preprocessNestedCodeBlocks } from "../../utils/markdown";

describe("preprocessNestedCodeBlocks", () => {
  it("内部にフェンスが無いコードブロックはそのまま返す", () => {
    const input = "```ts\nconst x = 1;\n```";
    expect(preprocessNestedCodeBlocks(input)).toBe(input);
  });

  it("コードブロック外のテキストはそのまま返す", () => {
    const input = "Hello world\n\nSome text";
    expect(preprocessNestedCodeBlocks(input)).toBe(input);
  });

  it("内部に同じ長さのフェンスがある場合、外側のフェンスを拡張する", () => {
    const input = "```markdown\nHere is code:\n```ts\nconst x = 1;\n```\n```";
    const result = preprocessNestedCodeBlocks(input);
    // 外側のフェンスが ```` に拡張されるはず
    expect(result).toBe("````markdown\nHere is code:\n```ts\nconst x = 1;\n```\n````");
  });

  it("内部に4文字のフェンスがある場合、外側を5文字に拡張する", () => {
    const input = "````md\nSome:\n````ts\ncode\n````\n````";
    const result = preprocessNestedCodeBlocks(input);
    expect(result).toBe("`````md\nSome:\n````ts\ncode\n````\n`````");
  });

  it("チルダフェンスも正しく処理する", () => {
    const input = "~~~md\n~~~ts\ncode\n~~~\n~~~";
    const result = preprocessNestedCodeBlocks(input);
    expect(result).toBe("~~~~md\n~~~ts\ncode\n~~~\n~~~~");
  });

  it("閉じフェンスが無い場合はそのまま返す", () => {
    const input = "```ts\nconst x = 1;\nno closing";
    expect(preprocessNestedCodeBlocks(input)).toBe(input);
  });

  it("複数のコードブロックを正しく処理する", () => {
    const input = "text\n```md\n```ts\nx\n```\n```\nmore text\n```js\nconsole.log();\n```";
    const result = preprocessNestedCodeBlocks(input);
    expect(result).toBe("text\n````md\n```ts\nx\n```\n````\nmore text\n```js\nconsole.log();\n```");
  });

  it("深くネストされたフェンスも正しく処理する", () => {
    const input = "```md\nOuter:\n```inner\n````deeper\ncode\n````\n```\n```";
    const result = preprocessNestedCodeBlocks(input);
    // 内部に ```` (4文字) があるので外側は ````` (5文字) になる
    expect(result).toBe("`````md\nOuter:\n```inner\n````deeper\ncode\n````\n```\n`````");
  });

  it("フェンス内にインラインバッククォートがあっても影響しない", () => {
    const input = "```ts\nconst s = `hello`;\n```";
    expect(preprocessNestedCodeBlocks(input)).toBe(input);
  });
});
