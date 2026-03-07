import { useCallback, useEffect, useRef } from "react";

/** ユーザーが「最下部付近」と判定するスクロール閾値（px） */
const NEAR_BOTTOM_THRESHOLD = 100;

/**
 * メッセージ一覧の自動スクロールを管理するフック。
 *
 * - 初回マウント時は無条件に最下部へスクロールする
 * - `messages` 更新時、ユーザーが最下部付近にいれば自動スクロールする
 * - ユーザーが上方にスクロールしている場合は追従しない
 */
export function useAutoScroll(messages: unknown[]) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD;
  }, []);

  // 初回マウント時に最下部へスクロールする
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // messages 更新時、最下部付近にいれば追従スクロールする
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages の参照変化を検知して effect を再実行する意図的な依存
  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return { containerRef, bottomRef, handleScroll } as const;
}
