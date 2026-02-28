import { useLocale } from "../../locales";
import { ActionButton } from "../atoms/ActionButton";

type Props = {
  onNewSession: () => void;
};

export function EmptyState({ onNewSession }: Props) {
  const t = useLocale();
  return (
    <div className="empty-state">
      <div className="empty-state-title">{t["empty.title"]}</div>
      <div className="empty-state-description">{t["empty.description"]}</div>
      <ActionButton onClick={onNewSession}>
        {t["empty.newChat"]}
      </ActionButton>
    </div>
  );
}
