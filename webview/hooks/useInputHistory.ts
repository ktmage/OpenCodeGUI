import { useCallback, useRef } from "react";
import { getPersistedState, setPersistedState } from "../vscode-api";

const MAX_HISTORY = 100;

/**
 * 入力履歴を管理するフック。
 *
 * 送信したテキストを `WebviewPersistedState` に永続化し、
 * ArrowUp / ArrowDown で過去の入力を呼び出せる。
 *
 * - `addEntry(text)`: 送信時に履歴へ追加する
 * - `navigateUp(currentText)`: ↑ キーで 1 つ前の履歴を返す（先頭なら null）
 * - `navigateDown(currentText)`: ↓ キーで 1 つ先の履歴を返す（末尾を超えたらドラフトを返す）
 * - `resetNavigation()`: テキスト編集時にナビゲーション状態をリセットする
 */
export function useInputHistory() {
  // -1 = ナビゲーション中でない, 0 = 最新, history.length-1 = 最古
  const indexRef = useRef(-1);
  const draftRef = useRef("");

  /** 永続化されている履歴配列を取得する（古い順） */
  const getHistory = useCallback((): string[] => {
    return getPersistedState()?.inputHistory ?? [];
  }, []);

  /** 履歴配列を永続化する */
  const saveHistory = useCallback((history: string[]) => {
    const state = getPersistedState() ?? {};
    setPersistedState({ ...state, inputHistory: history });
  }, []);

  /** テキスト送信時に履歴へ追加する */
  const addEntry = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const history = getHistory();
      history.push(trimmed);

      // 上限を超えたら古いものを削除
      if (history.length > MAX_HISTORY) {
        history.splice(0, history.length - MAX_HISTORY);
      }

      saveHistory(history);
      // ナビゲーション状態をリセット
      indexRef.current = -1;
      draftRef.current = "";
    },
    [getHistory, saveHistory],
  );

  /**
   * ↑ キーで 1 つ前の履歴を返す。
   * 初回呼び出し時に currentText をドラフトとして保存する。
   * これ以上遡れない場合は null を返す。
   */
  const navigateUp = useCallback(
    (currentText: string): string | null => {
      const history = getHistory();
      if (history.length === 0) return null;

      if (indexRef.current === -1) {
        // ナビゲーション開始 → ドラフト保存
        draftRef.current = currentText;
        indexRef.current = history.length - 1;
        return history[indexRef.current];
      }

      if (indexRef.current <= 0) {
        // 最古の履歴にいる → これ以上遡れない
        return null;
      }

      indexRef.current -= 1;
      return history[indexRef.current];
    },
    [getHistory],
  );

  /**
   * ↓ キーで 1 つ先の履歴を返す。
   * 最新を超えたらドラフトを復元して返す。
   * ナビゲーション中でなければ null を返す。
   */
  const navigateDown = useCallback(
    (_currentText: string): string | null => {
      if (indexRef.current === -1) return null;

      const history = getHistory();

      if (indexRef.current >= history.length - 1) {
        // 最新の履歴にいる → ドラフトに戻る
        indexRef.current = -1;
        return draftRef.current;
      }

      indexRef.current += 1;
      return history[indexRef.current];
    },
    [getHistory],
  );

  /** ユーザーがテキストを編集したらナビゲーション状態をリセットする */
  const resetNavigation = useCallback(() => {
    indexRef.current = -1;
    draftRef.current = "";
  }, []);

  return { addEntry, navigateUp, navigateDown, resetNavigation };
}
