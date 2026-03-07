import type { TextPart } from "@opencodegui/core";
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import { Marked, type Renderer, type Tokens } from "marked";
import { createElement, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { getFileIcon } from "../../../utils/file-icons";
import { preprocessNestedCodeBlocks } from "../../../utils/markdown";
import { postMessage } from "../../../vscode-api";

// --- SVG アイコン (VSC アイコン相当) ---
const COPY_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 4l1-1h5.414L14 6.586V14l-1 1H5l-1-1V4zm9 3l-3-3H5v10h8V7z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3 1L2 2v10l1 1V2h6.414l-1-1H3z"/></svg>`;
const CHECK_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.763.646z"/></svg>`;

/** ファイルパスから拡張子に応じたアイコンの HTML 文字列を生成する（結果はキャッシュ） */
const fileIconHtmlCache = new Map<string, string>();
function getFileIconHtml(filePath: string): string {
  const fileName = filePath.split("/").pop() || filePath;
  const FileTypeIcon = getFileIcon(fileName);
  const key = FileTypeIcon.name;

  const cached = fileIconHtmlCache.get(key);
  if (cached) return cached;

  const container = document.createElement("span");
  const root = createRoot(container);
  flushSync(() => {
    root.render(createElement(FileTypeIcon, { width: 12, height: 12, className: "file-chip-icon" }));
  });
  const html = container.innerHTML;
  root.unmount();

  fileIconHtmlCache.set(key, html);
  return html;
}

/**
 * コードブロック用カスタムレンダラー。
 * - highlight.js によるシンタックスハイライトを適用する
 * - ヘッダーにコピーボタン（plain HTML）を直接出力する
 */
const codeRenderer: Partial<Renderer> = {
  code({ text, lang }: Tokens.Code): string {
    let highlighted: string;
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(text, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
    const langLabel = lang ? `<span class="code-block-lang">${lang}</span>` : "";
    const copyBtn = `<button class="code-block-copy" type="button" aria-label="Copy code">${COPY_ICON}</button>`;
    return `<div class="code-block-wrapper"><div class="code-block-header">${langLabel}${copyBtn}</div><pre><code class="hljs${lang ? ` language-${lang}` : ""}">${highlighted}</code></pre></div>`;
  },
};

/**
 * マークダウンリンクのカスタムレンダラー。
 * href がローカル絶対パス（/始まり）の場合、data-file-path 属性を付与してクリックインターセプトの対象にする。
 * 行番号は `#L{number}` フラグメントから抽出する。
 */
const linkRenderer: Partial<Renderer> = {
  link({ href, text }: Tokens.Link): string {
    if (href.startsWith("/")) {
      // フラグメントから行番号を抽出する
      const lineMatch = href.match(/#L(\d+)$/);
      const filePath = lineMatch ? href.slice(0, lineMatch.index) : href;
      const lineAttr = lineMatch ? ` data-file-line="${lineMatch[1]}"` : "";
      const escapedPath = filePath.replace(/"/g, "&quot;");
      const iconHtml = getFileIconHtml(filePath);
      return `<a href="#" class="file-chip" data-file-path="${escapedPath}"${lineAttr}>${iconHtml}<span class="file-chip-label">${text}</span></a>`;
    }
    return `<a href="${href}">${text}</a>`;
  },
};

// DOMPurify で SVG 要素とカスタム data 属性を許可する設定
const PURIFY_CONFIG: DOMPurify.Config = {
  ADD_TAGS: ["svg", "path", "rect", "circle", "ellipse", "polygon", "text", "linearGradient", "stop", "defs"],
  ADD_ATTR: [
    "viewBox",
    "fill",
    "fill-rule",
    "clip-rule",
    "d",
    "xmlns",
    "data-file-path",
    "data-file-line",
    "rx",
    "ry",
    "r",
    "cx",
    "cy",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "transform",
    "opacity",
    "points",
    "text-anchor",
    "font-weight",
    "font-size",
    "font-family",
    "dominant-baseline",
    "x1",
    "x2",
    "y1",
    "y2",
    "offset",
    "stop-color",
    "gradientUnits",
    "aria-hidden",
  ],
};

/**
 * 絶対ファイルパスの正規表現。
 * コードブロック内やすでに HTML タグ内にあるパスを除外するため、HTML 後処理で使用する。
 * パスは /[alphanumeric/._-]+ の形式で、拡張子を持つもののみマッチする。
 */
const ABSOLUTE_PATH_RE = /(?<!["\w/])(\/([\w.-]+\/)*[\w.-]+\.\w+)(?::(\d+))?/g;

/**
 * HTML 文字列中のコードブロック外にある絶対ファイルパスをリンク化する。
 * <pre>, <code>, <a> タグの内部は変換しない。
 */
function linkifyAbsolutePaths(html: string): string {
  // タグとテキストを分離して処理する
  // HTML タグ内部のパスや、既にリンク内・コード内のパスは変換しない
  let depth = 0;
  const SKIP_OPEN = /<(pre|code|a)[\s>]/gi;
  const SKIP_CLOSE = /<\/(pre|code|a)>/gi;

  return html.replace(/(<[^>]+>)|([^<]+)/g, (_match, tag: string | undefined, text: string | undefined) => {
    if (tag) {
      // スキップ対象タグの深さ管理
      SKIP_OPEN.lastIndex = 0;
      SKIP_CLOSE.lastIndex = 0;
      if (SKIP_OPEN.test(tag)) depth++;
      else if (SKIP_CLOSE.test(tag)) depth = Math.max(0, depth - 1);
      return tag;
    }
    if (!text || depth > 0) return text ?? "";
    // テキストノード内の絶対パスをリンク化
    return text.replace(ABSOLUTE_PATH_RE, (_m, filePath: string, _dir: string, lineNum: string | undefined) => {
      const escapedPath = filePath.replace(/"/g, "&quot;");
      const lineAttr = lineNum ? ` data-file-line="${lineNum}"` : "";
      const display = lineNum ? `${filePath}:${lineNum}` : filePath;
      const iconHtml = getFileIconHtml(filePath);
      return `<a href="#" class="file-chip" data-file-path="${escapedPath}"${lineAttr}>${iconHtml}<span class="file-chip-label">${display}</span></a>`;
    });
  });
}

// marked インスタンス（グローバル状態を汚染しない）
const markdownParser = new Marked({ breaks: true }, { renderer: { ...codeRenderer, ...linkRenderer } });

type Props = {
  part: TextPart;
};

export function TextPartView({ part }: Props) {
  const html = useMemo(() => {
    const preprocessed = preprocessNestedCodeBlocks(part.text);
    const raw = markdownParser.parse(preprocessed, { async: false }) as string;
    const linked = linkifyAbsolutePaths(raw);
    return DOMPurify.sanitize(linked, PURIFY_CONFIG);
  }, [part.text]);

  // イベント委譲: コンテナ要素に1つのクリックハンドラーを付けて
  // .code-block-copy ボタンと data-file-path リンクのクリックを検出する
  const handleClick = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.target as HTMLElement;

    // ファイルパスリンクのクリック処理
    const fileLink = target.closest<HTMLAnchorElement>("a[data-file-path]");
    if (fileLink) {
      e.preventDefault();
      const filePath = fileLink.dataset.filePath;
      if (filePath) {
        const line = fileLink.dataset.fileLine ? Number(fileLink.dataset.fileLine) : undefined;
        postMessage({ type: "openFile", filePath, line });
      }
      return;
    }

    // コピーボタンのクリック処理
    const btn = target.closest<HTMLButtonElement>(".code-block-copy");
    if (!btn) return;

    const wrapper = btn.closest(".code-block-wrapper");
    const codeEl = wrapper?.querySelector<HTMLElement>("pre code");
    if (!codeEl) return;

    const code = codeEl.textContent ?? "";
    postMessage({ type: "copyToClipboard", text: code });

    btn.innerHTML = CHECK_ICON;
    btn.classList.add("copied");
    setTimeout(() => {
      btn.innerHTML = COPY_ICON;
      btn.classList.remove("copied");
    }, 1500);
  }, []);

  // biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify でサニタイズ済みの HTML を描画する
  // biome-ignore lint/a11y/useKeyWithClickEvents: コピーボタンとファイルリンクのイベント委譲
  return <span className="markdown" onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
