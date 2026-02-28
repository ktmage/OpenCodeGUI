import { type RefObject, useEffect, useRef } from "react";

/**
 * 指定した ref 要素群の外側がクリックされたときにコールバックを呼ぶ。
 *
 * @param refs     監視対象の ref（単一 or 配列）。配列の場合、すべての要素の外側をクリックしたときのみ発火する。
 * @param callback 外部クリック時に呼ばれるコールバック。
 * @param enabled  リスナーを有効にするかどうか（デフォルト: true）。
 */
export function useClickOutside(
  refs: RefObject<Element | null> | RefObject<Element | null>[],
  callback: () => void,
  enabled = true,
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const refsRef = useRef(refs);
  refsRef.current = refs;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: MouseEvent) => {
      const refArray = Array.isArray(refsRef.current) ? refsRef.current : [refsRef.current];
      const isOutside = refArray.every((r) => !r.current || !r.current.contains(e.target as Node));
      if (isOutside) {
        callbackRef.current();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [enabled]);
}
