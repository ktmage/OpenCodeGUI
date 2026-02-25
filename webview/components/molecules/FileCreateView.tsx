import { useLocale } from "../../locales";

type Props = {
  content: string;
};

export function FileCreateView({ content }: Props) {
  const t = useLocale();
  const lines = content.split("\n");
  const displayLines = lines.length > 30 ? [...lines.slice(0, 30), t["tool.moreLines"](lines.length - 30)] : lines;
  return (
    <div className="tool-diff">
      <div className="tool-diff-stats">
        <span className="tool-diff-stat-add">{t["tool.addLines"](lines.length)}</span>
      </div>
      <div className="tool-diff-lines">
        {displayLines.map((line, i) => (
          <div key={i} className="tool-diff-line tool-diff-line-add">
            <span className="tool-diff-line-marker">+</span>
            <span className="tool-diff-line-text">{line || "\u00A0"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
