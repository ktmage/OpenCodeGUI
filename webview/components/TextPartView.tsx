import { useMemo } from "react";
import { marked } from "marked";
import type { TextPart } from "@opencode-ai/sdk";

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

  return (
    <span
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
