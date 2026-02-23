import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession, createMessage, createTextPart, createPermission } from "../factories";

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

// 05 Permissions
describe("05 パーミッション", () => {
  // permission.updated event shows PermissionView
  it("permission.updated イベントで PermissionView が表示される", async () => {
    await setupWithPermission();

    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.updated",
        properties: {
          id: "perm-1",
          title: "Allow file write to src/main.ts?",
          messageID: "m1",
          sessionID: "s1",
        },
      } as any,
    });

    expect(screen.getByText("Allow file write to src/main.ts?")).toBeInTheDocument();
    expect(screen.getByText("Allow")).toBeInTheDocument();
    expect(screen.getByText("Once")).toBeInTheDocument();
    expect(screen.getByText("Deny")).toBeInTheDocument();
  });

  // Allow button sends replyPermission with "always"
  it("Allow ボタンで replyPermission に always が送信される", async () => {
    const session = await setupWithPermission();
    const user = userEvent.setup();

    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.updated",
        properties: { id: "perm-1", title: "Allow?", messageID: "m1", sessionID: "s1" },
      } as any,
    });

    await user.click(screen.getByText("Allow"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "replyPermission",
      sessionId: session.id,
      permissionId: "perm-1",
      response: "always",
    });
  });

  // Once button sends replyPermission with "once"
  it("Once ボタンで replyPermission に once が送信される", async () => {
    const session = await setupWithPermission();
    const user = userEvent.setup();

    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.updated",
        properties: { id: "perm-1", title: "Allow?", messageID: "m1", sessionID: "s1" },
      } as any,
    });

    await user.click(screen.getByText("Once"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "replyPermission",
      sessionId: session.id,
      permissionId: "perm-1",
      response: "once",
    });
  });

  // Deny button sends replyPermission with "reject"
  it("Deny ボタンで replyPermission に reject が送信される", async () => {
    const session = await setupWithPermission();
    const user = userEvent.setup();

    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.updated",
        properties: { id: "perm-1", title: "Allow?", messageID: "m1", sessionID: "s1" },
      } as any,
    });

    await user.click(screen.getByText("Deny"));

    expect(postMessage).toHaveBeenCalledWith({
      type: "replyPermission",
      sessionId: session.id,
      permissionId: "perm-1",
      response: "reject",
    });
  });

  // permission.replied event hides PermissionView
  it("permission.replied イベントで PermissionView が非表示になる", async () => {
    await setupWithPermission();

    // パーミッション表示
    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.updated",
        properties: { id: "perm-1", title: "Allow write?", messageID: "m1", sessionID: "s1" },
      } as any,
    });
    expect(screen.getByText("Allow write?")).toBeInTheDocument();

    // パーミッション応答
    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.replied",
        properties: { permissionID: "perm-1" },
      } as any,
    });

    expect(screen.queryByText("Allow write?")).not.toBeInTheDocument();
  });
});
