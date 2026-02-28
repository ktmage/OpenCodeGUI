import type { TextPart } from "@opencode-ai/sdk";
import DOMPurify from "dompurify";
import { marked } from "marked";
import { useMemo } from "react";

// marked のデフォルト設定
marked.setOptions({
  breaks: true,
});

type Props = {
  part: TextPart;
};

export function TextPartView({ part }: Props) {
  const html = useMemo(() => {
    const raw = marked.parse(part.text, { async: false }) as string;
    return DOMPurify.sanitize(raw);
  }, [part.text]);

  // biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify でサニタイズ済みの HTML を描画する
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
