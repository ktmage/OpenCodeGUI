import { useLocale } from "../../locales";

type Props = {
  onNewSession: () => void;
};

export function EmptyState({ onNewSession }: Props) {
  const t = useLocale();
  return (
    <div className="empty-state">
      <div className="empty-state-title">{t["empty.title"]}</div>
      <div className="empty-state-description">{t["empty.description"]}</div>
      <button type="button" className="btn" onClick={onNewSession}>
        {t["empty.newChat"]}
      </button>
    </div>
  );
}
