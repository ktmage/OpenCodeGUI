import type { TextPart } from "@opencodegui/core";
import DOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import { Marked, type Renderer, type Tokens } from "marked";
import { useCallback, useMemo } from "react";
import { preprocessNestedCodeBlocks } from "../../../utils/markdown";
import { postMessage } from "../../../vscode-api";

// --- SVG アイコン (VSC アイコン相当) ---
const COPY_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M4 4l1-1h5.414L14 6.586V14l-1 1H5l-1-1V4zm9 3l-3-3H5v10h8V7z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M3 1L2 2v10l1 1V2h6.414l-1-1H3z"/></svg>`;
const CHECK_ICON = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.763.646z"/></svg>`;

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

// DOMPurify で SVG 要素を許可する設定
const PURIFY_CONFIG: DOMPurify.Config = {
  ADD_TAGS: ["svg", "path"],
  ADD_ATTR: ["viewBox", "fill", "fill-rule", "clip-rule", "d", "xmlns"],
};

// marked インスタンス（グローバル状態を汚染しない）
const markdownParser = new Marked({ breaks: true }, { renderer: codeRenderer });

type Props = {
  part: TextPart;
};

export function TextPartView({ part }: Props) {
  const html = useMemo(() => {
    const preprocessed = preprocessNestedCodeBlocks(part.text);
    const raw = markdownParser.parse(preprocessed, { async: false }) as string;
    return DOMPurify.sanitize(raw, PURIFY_CONFIG);
  }, [part.text]);

  // イベント委譲: コンテナ要素に1つのクリックハンドラーを付けて
  // .code-block-copy ボタンのクリックを検出する
  const handleClick = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    const target = e.target as HTMLElement;
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
  // biome-ignore lint/a11y/useKeyWithClickEvents: コピーボタンのイベント委譲
  return <span className="markdown" onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
