import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** エージェントメンションテスト用のセットアップ */
async function setupWithAgents() {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

  // エージェント一覧を設定
  await sendExtMessage({
    type: "agents",
    agents: [
      {
        name: "coder",
        description: "Coding agent",
        mode: "subagent",
        builtIn: true,
        permission: { edit: "ask", bash: {} },
        tools: {},
        options: {},
      },
      {
        name: "researcher",
        description: "Research agent",
        mode: "subagent",
        builtIn: true,
        permission: { edit: "ask", bash: {} },
        tools: {},
        options: {},
      },
    ] as any,
  });

  vi.mocked(postMessage).mockClear();
}

// Agent mention
describe("エージェントメンション", () => {
  // @ trigger shows agent popup
  context("@ トリガーを入力した場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // shows agent popup
    it("エージェント候補ポップアップが表示されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      expect(screen.getByTestId("agent-popup")).toBeInTheDocument();
    });

    // shows agent names in popup
    it("エージェント名がポップアップに表示されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      expect(screen.getByText("coder")).toBeInTheDocument();
      expect(screen.getByText("researcher")).toBeInTheDocument();
    });

    // filters agents by query
    it("クエリでエージェントをフィルタすること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@cod");
      expect(screen.getByText("coder")).toBeInTheDocument();
      expect(screen.queryByText("researcher")).not.toBeInTheDocument();
    });
  });

  // Selecting an agent
  context("エージェントを選択した場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // shows agent indicator
    it("エージェントインジケーターが表示されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.click(screen.getByText("coder"));
      expect(screen.getByText("@coder")).toBeInTheDocument();
    });

    // closes the popup
    it("ポップアップが閉じること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.click(screen.getByText("coder"));
      expect(screen.queryByTestId("agent-popup")).not.toBeInTheDocument();
    });

    // removes @ from text
    it("テキストから @ が削除されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)") as HTMLTextAreaElement;
      await user.type(textarea, "@");
      await user.click(screen.getByText("coder"));
      expect(textarea.value).toBe("");
    });
  });

  // Sending with selected agent
  context("エージェント選択後にメッセージを送信した場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // includes agent in sendMessage
    it("sendMessage に agent が含まれること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.click(screen.getByText("coder"));
      await user.type(textarea, "Fix the bug");
      await user.keyboard("{Enter}");
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "sendMessage",
          text: "Fix the bug",
          agent: "coder",
        }),
      );
    });
  });

  // Sending without agent
  context("エージェント未選択でメッセージを送信した場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // does not include agent in sendMessage
    it("sendMessage に agent が含まれないこと", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "Hello");
      await user.keyboard("{Enter}");
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "sendMessage",
          text: "Hello",
        }),
      );
      expect(postMessage).not.toHaveBeenCalledWith(
        expect.objectContaining({
          type: "sendMessage",
          agent: expect.anything(),
        }),
      );
    });
  });

  // Escape closes popup
  context("@ ポップアップ表示中に Escape を押した場合", () => {
    beforeEach(async () => {
      await setupWithAgents();
    });

    // closes the agent popup
    it("エージェントポップアップが閉じること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      expect(screen.getByTestId("agent-popup")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByTestId("agent-popup")).not.toBeInTheDocument();
    });
  });
});
