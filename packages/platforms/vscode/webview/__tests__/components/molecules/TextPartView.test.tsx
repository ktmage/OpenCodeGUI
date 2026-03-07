import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TextPartView } from "../../../components/molecules/TextPartView";
import { postMessage } from "../../../vscode-api";
import { createTextPart } from "../../factories";

describe("TextPartView", () => {
  // when rendered with a text part
  context("テキストパートを渡した場合", () => {
    // renders HTML content
    it("HTML コンテンツをレンダリングすること", () => {
      const part = createTextPart("Hello world");
      const { container } = render(<TextPartView part={part} />);
      expect(container.querySelector("span")).toBeInTheDocument();
    });

    // renders the text
    it("テキストを表示すること", () => {
      const part = createTextPart("Hello world");
      const { container } = render(<TextPartView part={part} />);
      expect(container.textContent).toContain("Hello world");
    });
  });

  // when text changes
  context("テキストが異なる場合", () => {
    // renders updated text
    it("更新されたテキストを表示すること", () => {
      const part = createTextPart("Updated text");
      const { container } = render(<TextPartView part={part} />);
      expect(container.textContent).toContain("Updated text");
    });
  });

  // XSS protection via DOMPurify
  context("悪意のある HTML を含むテキストの場合", () => {
    // strips <script> tags
    it("<script> タグが除去されること", () => {
      const part = createTextPart('<script>alert("xss")</script>');
      const { container } = render(<TextPartView part={part} />);
      expect(container.querySelector("script")).toBeNull();
    });

    // strips onerror attributes
    it("onerror 属性が除去されること", () => {
      const part = createTextPart('<img src="x" onerror="alert(1)">');
      const { container } = render(<TextPartView part={part} />);
      expect(container.innerHTML).not.toContain("onerror");
    });

    // strips javascript: URLs
    it("javascript: URL が除去されること", () => {
      const part = createTextPart('<a href="javascript:alert(1)">click</a>');
      const { container } = render(<TextPartView part={part} />);
      expect(container.innerHTML).not.toContain("javascript:");
    });

    // strips <iframe> tags
    it("<iframe> タグが除去されること", () => {
      const part = createTextPart('<iframe src="https://evil.com"></iframe>');
      const { container } = render(<TextPartView part={part} />);
      expect(container.querySelector("iframe")).toBeNull();
    });

    // preserves safe HTML content
    it("安全な HTML コンテンツは保持されること", () => {
      const part = createTextPart("safe <b>bold</b> text");
      const { container } = render(<TextPartView part={part} />);
      expect(container.textContent).toContain("safe bold text");
    });
  });

  // file path link click handling
  context("ファイルパスリンクをクリックした場合", () => {
    // sends openFile message when file link is clicked
    it("openFile メッセージが送信されること", () => {
      // marked モックは <p>text</p> を返すが、linkifyAbsolutePaths が
      // 絶対パスを data-file-path 付きリンクに変換する
      const part = createTextPart("See /home/user/project/src/main.ts for details");
      const { container } = render(<TextPartView part={part} />);
      const link = container.querySelector("a[data-file-path]");
      expect(link).toBeInTheDocument();
      fireEvent.click(link!);
      expect(vi.mocked(postMessage)).toHaveBeenCalledWith({
        type: "openFile",
        filePath: "/home/user/project/src/main.ts",
        line: undefined,
      });
    });

    // sends openFile message with line number when path has :line suffix
    it("行番号付きパスの場合 line が送信されること", () => {
      const part = createTextPart("Error at /home/user/project/src/main.ts:42 found");
      const { container } = render(<TextPartView part={part} />);
      const link = container.querySelector("a[data-file-path]");
      expect(link).toBeInTheDocument();
      fireEvent.click(link!);
      expect(vi.mocked(postMessage)).toHaveBeenCalledWith({
        type: "openFile",
        filePath: "/home/user/project/src/main.ts",
        line: 42,
      });
    });
  });
});
