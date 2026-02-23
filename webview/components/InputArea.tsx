import { useState, useRef, useCallback, type KeyboardEvent } from "react";

type Props = {
  onSend: (text: string) => void;
  onAbort: () => void;
  isBusy: boolean;
};

export function InputArea({ onSend, onAbort, isBusy }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    // テキストエリアの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Enter で送信、Shift+Enter で改行（Copilot と同じ挙動）
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (isBusy) return;
        handleSend();
      }
    },
    [handleSend, isBusy],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className="input-textarea"
          placeholder="Ask OpenCode..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
        />
        {isBusy ? (
          <button className="send-button" onClick={onAbort} title="Stop">
            {/* Codicon: debug-stop */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="3" width="10" height="10" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            className="send-button"
            onClick={handleSend}
            disabled={!text.trim()}
            title="Send"
          >
            {/* Codicon: send */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 1.5l14 6.5-14 6.5V9l8-1-8-1V1.5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
