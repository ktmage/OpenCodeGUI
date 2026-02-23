type Props = {
  onNewSession: () => void;
};

export function EmptyState({ onNewSession }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state-title">OpenCode</div>
      <div className="empty-state-description">
        Start a new conversation to get started.
      </div>
      <button className="btn" onClick={onNewSession}>
        New Chat
      </button>
    </div>
  );
}
