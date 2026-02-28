import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** テスト用エージェントデータ（subagent + primary を含む） */
const testAgents = [
  {
    name: "general",
    description: "General purpose subagent",
    mode: "subagent",
    builtIn: true,
    permission: { edit: "ask", bash: {} },
    tools: {},
    options: {},
  },
  {
    name: "explore",
    description: "Read-only exploration subagent",
    mode: "subagent",
    builtIn: true,
    permission: { edit: "deny", bash: {} },
    tools: {},
    options: {},
  },
  {
    name: "build",
    description: "Primary build agent",
    mode: "primary",
    builtIn: true,
    permission: { edit: "ask", bash: {} },
    tools: {},
    options: {},
  },
  {
    name: "plan",
    description: "Primary plan agent",
    mode: "primary",
    builtIn: true,
    permission: { edit: "deny", bash: {} },
    tools: {},
    options: {},
  },
] as any;

/** エージェントメンションテスト用のセットアップ */
async function setupWithAgents() {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

  // エージェント一覧を設定（subagent + primary を含む）
  await sendExtMessage({ type: "agents", agents: testAgents });

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

    // shows only subagent names in popup (not primary agents)
    it("サブエージェントのみポップアップに表示されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      // subagent の general と explore が表示される
      expect(screen.getByText("general")).toBeInTheDocument();
      expect(screen.getByText("explore")).toBeInTheDocument();
      // primary の build と plan は表示されない
      expect(screen.queryByText("build")).not.toBeInTheDocument();
      expect(screen.queryByText("plan")).not.toBeInTheDocument();
    });

    // filters agents by query
    it("クエリでエージェントをフィルタすること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@gen");
      expect(screen.getByText("general")).toBeInTheDocument();
      expect(screen.queryByText("explore")).not.toBeInTheDocument();
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
      await user.click(screen.getByText("general"));
      expect(screen.getByText("@general")).toBeInTheDocument();
    });

    // closes the popup
    it("ポップアップが閉じること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "@");
      await user.click(screen.getByText("general"));
      expect(screen.queryByTestId("agent-popup")).not.toBeInTheDocument();
    });

    // removes @ from text
    it("テキストから @ が削除されること", async () => {
      const user = userEvent.setup();
      const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)") as HTMLTextAreaElement;
      await user.type(textarea, "@");
      await user.click(screen.getByText("general"));
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
      await user.click(screen.getByText("general"));
      await user.type(textarea, "Fix the bug");
      await user.keyboard("{Enter}");
      expect(postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "sendMessage",
          text: "Fix the bug",
          agent: "general",
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
