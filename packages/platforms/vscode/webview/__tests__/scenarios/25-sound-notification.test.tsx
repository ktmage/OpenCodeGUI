import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setPersistedState } from "../../vscode-api";
import { createSession } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/** 設定パネル用のアクティブセッションをセットアップする */
async function setupForSoundSettings() {
  renderApp();
  const session = createSession({ id: "s1" });
  await sendExtMessage({ type: "activeSession", session });
  await sendExtMessage({
    type: "toolConfig",
    paths: {
      home: "/home/user",
      config: "/home/user/.config/opencode",
      state: "/home/user/.local/state/opencode",
      directory: "/workspace",
    },
  });
}

// Sound notification scenario
describe("サウンド通知", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Sound settings appear in settings panel
  it("設定パネルにサウンド通知セクションが表示されること", async () => {
    await setupForSoundSettings();
    const user = userEvent.setup();

    // 設定パネルを開く
    await user.click(screen.getByTitle("Settings"));

    // サウンド通知セクションが表示される
    expect(screen.getByText("Sound Notification")).toBeInTheDocument();
    expect(screen.getByText("Response complete")).toBeInTheDocument();
    expect(screen.getByText("Permission request")).toBeInTheDocument();
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  // Toggling sound setting updates persisted state
  it("サウンド設定の ON/OFF 切り替えで persisted state が更新されること", async () => {
    await setupForSoundSettings();
    const user = userEvent.setup();

    await user.click(screen.getByTitle("Settings"));

    // 「Response complete」のチェックボックスをクリック（デフォルト ON → OFF）
    const checkboxes = screen.getAllByRole("checkbox");
    // 最初のチェックボックスが responseComplete
    await user.click(checkboxes[0]);

    expect(setPersistedState).toHaveBeenCalledWith(
      expect.objectContaining({
        soundSettings: expect.objectContaining({
          responseComplete: expect.objectContaining({ enabled: false }),
        }),
      }),
    );
  });

  // Session busy → idle triggers sound
  it("セッションが busy → idle になるとサウンドが再生されること", async () => {
    await setupForSoundSettings();

    // busy にする
    await sendExtMessage({
      type: "event",
      event: {
        type: "session.status",
        properties: { sessionID: "s1", status: { type: "busy" } },
      },
    });

    // idle にする
    await sendExtMessage({
      type: "event",
      event: {
        type: "session.status",
        properties: { sessionID: "s1", status: { type: "idle" } },
      },
    });

    expect(AudioContext).toHaveBeenCalled();
  });

  // Permission event triggers sound
  it("パーミッション要求でサウンドが再生されること", async () => {
    await setupForSoundSettings();

    await sendExtMessage({
      type: "event",
      event: {
        type: "permission.updated",
        properties: { id: "perm1", title: "allow bash", sessionID: "s1", messageID: "m1", type: "execute" },
      },
    });

    expect(AudioContext).toHaveBeenCalled();
  });

  // Error event triggers sound
  it("エラーイベントでサウンドが再生されること", async () => {
    await setupForSoundSettings();

    await sendExtMessage({
      type: "event",
      event: {
        type: "session.error",
        properties: { sessionID: "s1", error: "something failed" },
      },
    });

    expect(AudioContext).toHaveBeenCalled();
  });
});
