import type { TextPart } from "@opencode-ai/sdk";
import { marked } from "marked";
import { useMemo } from "react";

// marked のデフォルト設定: XSS 対策のため HTML タグをエスケープする
marked.setOptions({
  breaks: true,
});

type Props = {
  part: TextPart;
};

export function TextPartView({ part }: Props) {
  const html = useMemo(() => {
    return marked.parse(part.text, { async: false }) as string;
  }, [part.text]);

  // biome-ignore lint/security/noDangerouslySetInnerHtml: marked v17 はデフォルトで HTML タグをエスケープするため、sanitize 済み HTML の描画に使用する
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
