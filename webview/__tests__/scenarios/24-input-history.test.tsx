import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WebviewPersistedState } from "../../vscode-api";
import { getPersistedState, setPersistedState } from "../../vscode-api";
import { createAllProvidersData, createProvider, createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

const mockGetPersistedState = vi.mocked(getPersistedState);
const mockSetPersistedState = vi.mocked(setPersistedState);

/** getPersistedState / setPersistedState を連動させて実際の永続化を模擬する */
function enableStatePersistence() {
  let state: WebviewPersistedState | undefined;
  mockGetPersistedState.mockImplementation(() => state);
  mockSetPersistedState.mockImplementation((s) => {
    state = s;
  });
}

/** アクティブセッション + プロバイダ付きで入力可能状態にする */
async function setupInputReady() {
  renderApp();
  const provider = createProvider("anthropic", {
    "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } },
  });
  await sendExtMessage({
    type: "providers",
    providers: [provider],
    allProviders: createAllProvidersData(
      ["anthropic"],
      [
        {
          id: "anthropic",
          name: "Anthropic",
          models: {
            "claude-4-opus": { id: "claude-4-opus", name: "Claude 4 Opus", limit: { context: 200000, output: 4096 } },
          },
        },
      ],
    ),
    default: { general: "anthropic/claude-4-opus" },
    configModel: "anthropic/claude-4-opus",
  });
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });
}

// Input History
describe("入力履歴", () => {
  beforeEach(() => {
    enableStatePersistence();
  });

  context("メッセージを送信した後にArrowUpを押した場合", () => {
    it("送信済みテキストが入力欄に復元されること", async () => {
      await setupInputReady();
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");

      // メッセージを送信する
      await user.type(textarea, "first message{Enter}");

      // 送信後にテキストがクリアされていることを確認
      expect(textarea).toHaveValue("");

      // ArrowUp で履歴を呼び出す
      fireEvent.keyDown(textarea, { key: "ArrowUp" });

      await waitFor(() => {
        expect(textarea).toHaveValue("first message");
      });
    });
  });

  context("複数メッセージを送信した後にArrowUpで遡る場合", () => {
    it("新しい順に履歴を辿れること", async () => {
      await setupInputReady();
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");

      // 複数メッセージを送信する
      await user.type(textarea, "alpha{Enter}");
      await user.type(textarea, "beta{Enter}");
      await user.type(textarea, "gamma{Enter}");

      // ArrowUp で最新から遡る
      fireEvent.keyDown(textarea, { key: "ArrowUp" });
      await waitFor(() => {
        expect(textarea).toHaveValue("gamma");
      });

      fireEvent.keyDown(textarea, { key: "ArrowUp" });
      await waitFor(() => {
        expect(textarea).toHaveValue("beta");
      });

      fireEvent.keyDown(textarea, { key: "ArrowUp" });
      await waitFor(() => {
        expect(textarea).toHaveValue("alpha");
      });
    });
  });

  context("履歴を遡った後にArrowDownで戻る場合", () => {
    it("ドラフトまで戻せること", async () => {
      await setupInputReady();
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");

      // メッセージを送信
      await user.type(textarea, "sent msg{Enter}");

      // ドラフトを入力してから ArrowUp
      await user.type(textarea, "my draft");
      fireEvent.keyDown(textarea, { key: "ArrowUp" });
      await waitFor(() => {
        expect(textarea).toHaveValue("sent msg");
      });

      // ArrowDown でドラフトに戻る
      fireEvent.keyDown(textarea, { key: "ArrowDown" });
      await waitFor(() => {
        expect(textarea).toHaveValue("my draft");
      });
    });
  });

  context("履歴が空のときにArrowUpを押した場合", () => {
    it("入力欄のテキストが変化しないこと", async () => {
      await setupInputReady();
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");

      await user.type(textarea, "current text");

      // ArrowUp — 履歴なし
      fireEvent.keyDown(textarea, { key: "ArrowUp" });

      // テキストが変わらないことを確認
      expect(textarea).toHaveValue("current text");
    });
  });

  context("履歴の最古エントリでさらにArrowUpを押した場合", () => {
    it("テキストが変化しないこと", async () => {
      await setupInputReady();
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");

      await user.type(textarea, "only one{Enter}");

      // 1 回目の ArrowUp → "only one"
      fireEvent.keyDown(textarea, { key: "ArrowUp" });
      await waitFor(() => {
        expect(textarea).toHaveValue("only one");
      });

      // 2 回目の ArrowUp → これ以上遡れない→変化なし
      fireEvent.keyDown(textarea, { key: "ArrowUp" });
      expect(textarea).toHaveValue("only one");
    });
  });
});
