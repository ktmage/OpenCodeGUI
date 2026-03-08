import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { postMessage } from "../../vscode-api";
import { createMessage, createSession, createTextPart } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** パーミッション付きのアクティブセッションをセットアップする */
async function setupWithPermission() {
  renderApp();
  const session = createSession({ id: "s1" });
  await sendExtMessage({ type: "activeSession", session });

  // アシスタントメッセージを追加
  const assistantMsg = createMessage({ id: "m1", sessionID: "s1", role: "assistant" });
  const textPart = createTextPart("Working on it...", { messageID: "m1" });
  await sendExtMessage({
    type: "messages",
    sessionId: "s1",
    messages: [{ info: assistantMsg, parts: [textPart] }],
  });

  vi.mocked(postMessage).mockClear();
  return session;
}

/** v2 形式の permission.asked イベントプロパティを作成するヘルパー */
function permissionAskedProps(overrides: Record<string, unknown> = {}) {
  return {
    id: "perm-1",
    permission: "edit",
    patterns: ["src/main.ts"],
    sessionID: "s1",
    metadata: {},
    always: [],
    ...overrides,
  };
}

// Permissions
describe("パーミッション", () => {
  // permission.asked event shows PermissionView in queue
  context("permission.asked イベントを受信した場合", () => {
    beforeEach(async () => {
      await setupWithPermission();

      await sendExtMessage({
        type: "event",
        event: {
          type: "permission.asked",
          properties: permissionAskedProps(),
        } as any,
      });
    });

    // Shows the permission type as title
    it("パーミッションタイプがタイトルとして表示されること", () => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    // Shows patterns as description
    it("パターンが表示されること", () => {
      expect(screen.getByText("src/main.ts")).toBeInTheDocument();
    });

    // Shows Allow button
    it("Allow ボタンが表示されること", () => {
      expect(screen.getByText("Allow")).toBeInTheDocument();
    });

    // Shows Once button
    it("Once ボタンが表示されること", () => {
      expect(screen.getByText("Once")).toBeInTheDocument();
    });

    // Shows Deny button
    it("Deny ボタンが表示されること", () => {
      expect(screen.getByText("Deny")).toBeInTheDocument();
    });
  });

  // Allow button sends replyPermission with "always" using permission.sessionID
  it("Allow ボタンで replyPermission に always が送信されること", async () => {
    await setupWithPermission();
    const user = userEvent.setup();

    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.asked",
        properties: permissionAskedProps(),
      } as any,
    });

    await user.click(screen.getByText("Allow"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "replyPermission",
      sessionId: "s1",
      permissionId: "perm-1",
      response: "always",
    });
  });

  // Once button sends replyPermission with "once"
  it("Once ボタンで replyPermission に once が送信されること", async () => {
    await setupWithPermission();
    const user = userEvent.setup();

    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.asked",
        properties: permissionAskedProps(),
      } as any,
    });

    await user.click(screen.getByText("Once"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "replyPermission",
      sessionId: "s1",
      permissionId: "perm-1",
      response: "once",
    });
  });

  // Deny button sends replyPermission with "reject"
  it("Deny ボタンで replyPermission に reject が送信されること", async () => {
    await setupWithPermission();
    const user = userEvent.setup();

    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.asked",
        properties: permissionAskedProps(),
      } as any,
    });

    await user.click(screen.getByText("Deny"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "replyPermission",
      sessionId: "s1",
      permissionId: "perm-1",
      response: "reject",
    });
  });

  // permission.replied event hides PermissionView
  it("permission.replied イベントで PermissionView が非表示になること", async () => {
    await setupWithPermission();

    // パーミッション表示
    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.asked",
        properties: permissionAskedProps(),
      } as any,
    });
    expect(screen.getByText("Edit")).toBeInTheDocument();

    // パーミッション応答
    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.replied",
        properties: { sessionID: "s1", requestID: "perm-1", reply: "always" },
      } as any,
    });

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  // 子セッションのパーミッションは permission.sessionID で応答される
  context("子セッションのパーミッションの場合", () => {
    it("permission.sessionID（子セッション ID）で応答すること", async () => {
      await setupWithPermission();
      const user = userEvent.setup();

      // 子セッション ID を持つパーミッション
      await sendExtMessage({
        type: "event",
        event: {
          type: "permission.asked",
          properties: permissionAskedProps({
            id: "perm-child",
            sessionID: "child-session-42",
          }),
        } as any,
      });

      await user.click(screen.getByText("Allow"));

      expect(postMessage).toHaveBeenCalledWith({
        type: "replyPermission",
        sessionId: "child-session-42",
        permissionId: "perm-child",
        response: "always",
      });
    });
  });

  // messageID が存在しないメッセージでもパーミッションが表示される（旧バグの回帰テスト）
  // v2 では tool.messageID はオプショナルなので、tool フィールドなしでもキュー表示される
  context("tool フィールドがない場合", () => {
    it("パーミッションキューに表示されること", async () => {
      await setupWithPermission();

      await sendExtMessage({
        type: "event",
        event: {
          type: "permission.asked",
          properties: permissionAskedProps({
            id: "perm-orphan",
            permission: "external_directory",
            patterns: ["/outside/project"],
          }),
        } as any,
      });

      expect(screen.getByText("External Directory")).toBeInTheDocument();
    });
  });
});
