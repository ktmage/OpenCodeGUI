import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { postMessage } from "../../vscode-api";
import { renderApp, sendExtMessage } from "../helpers";
import { createSession } from "../factories";
import type { FileAttachment } from "../../vscode-api";

/** ファイルコンテキストテスト用のアクティブセッションをセットアップする */
async function setupWithFiles() {
  renderApp();
  await sendExtMessage({ type: "activeSession", session: createSession({ id: "s1" }) });

  // エディタで開いているファイルとワークスペースファイルを設定
  await sendExtMessage({
    type: "openEditors",
    files: [
      { filePath: "src/main.ts", fileName: "main.ts" },
      { filePath: "src/utils.ts", fileName: "utils.ts" },
    ],
  });
  await sendExtMessage({
    type: "workspaceFiles",
    files: [
      { filePath: "src/main.ts", fileName: "main.ts" },
      { filePath: "src/utils.ts", fileName: "utils.ts" },
      { filePath: "src/config.ts", fileName: "config.ts" },
      { filePath: "README.md", fileName: "README.md" },
    ],
  });

  vi.mocked(postMessage).mockClear();
}

// File context
describe("ファイルコンテキスト", () => {
  // Clip button opens the file picker
  it("クリップボタンでファイルピッカーが開くこと", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    await user.click(screen.getByTitle("Add context"));

    // ファイル一覧が表示される
    expect(screen.getByPlaceholderText("Search files...")).toBeInTheDocument();
  });

  // Selecting a file shows a chip and closes the picker
  context("ファイルを選択した場合", () => {
    beforeEach(async () => {
      await setupWithFiles();
      const user = userEvent.setup();
      await user.click(screen.getByTitle("Add context"));
      const items = screen.getAllByText("main.ts");
      const pickerItem = items.find((el) => el.closest(".file-picker-item"));
      await user.click(pickerItem!.closest(".file-picker-item")!);
    });

    // Chip is shown
    it("チップが表示されること", () => {
      const chips = document.querySelectorAll(".attached-file-chip");
      expect(chips.length).toBe(1);
    });

    // Picker is closed
    it("ピッカーが閉じること", () => {
      expect(screen.queryByPlaceholderText("Search files...")).not.toBeInTheDocument();
    });
  });

  // Chip remove button detaches the file
  it("チップの削除ボタンでファイルが除去されること", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    // ファイルを添付
    await user.click(screen.getByTitle("Add context"));
    const items = screen.getAllByText("main.ts");
    const pickerItem = items.find((el) => el.closest(".file-picker-item"));
    await user.click(pickerItem!.closest(".file-picker-item")!);

    // チップが表示される
    expect(document.querySelectorAll(".attached-file-chip").length).toBe(1);

    // 削除ボタンをクリック
    await user.click(screen.getByTitle("Remove"));

    // チップが消える
    expect(document.querySelectorAll(".attached-file-chip").length).toBe(0);
  });

  // # trigger shows file candidate popup
  it("# トリガーでファイル候補ポップアップが表示されること", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "#");

    // ハッシュポップアップが表示される
    const popup = document.querySelector(".hash-popup");
    expect(popup).toBeTruthy();
  });

  // # query filters files and sends searchWorkspaceFiles
  it("# クエリでファイルがフィルタされ searchWorkspaceFiles が送信されること", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "#config");

    expect(postMessage).toHaveBeenCalledWith({
      type: "searchWorkspaceFiles",
      query: "config",
    });
  });

  // Selecting from # popup removes the # portion and attaches the file
  context("# からファイルを選択した場合", () => {
    let textarea: HTMLElement;

    beforeEach(async () => {
      await setupWithFiles();
      const user = userEvent.setup();
      textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
      await user.type(textarea, "Look at #");
      const popup = document.querySelector(".hash-popup");
      const popupItem = popup!.querySelector(".hash-popup-item");
      await user.click(popupItem!);
    });

    // Hash portion is removed from text
    it("テキストから # 部分が除去されること", () => {
      expect(textarea).toHaveValue("Look at ");
    });

    // File chip is shown
    it("ファイルチップが表示されること", () => {
      expect(document.querySelectorAll(".attached-file-chip").length).toBe(1);
    });
  });

  // Sending message with attached files includes files in the payload
  it("添付ファイル付きメッセージ送信で files が含まれること", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    // ファイルを添付
    await user.click(screen.getByTitle("Add context"));
    const items = screen.getAllByText("main.ts");
    const pickerItem = items.find((el) => el.closest(".file-picker-item"));
    await user.click(pickerItem!.closest(".file-picker-item")!);

    // メッセージ送信
    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "Check this file{Enter}");

    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "sendMessage",
        sessionId: "s1",
        text: "Check this file",
        files: [{ filePath: "src/main.ts", fileName: "main.ts" }],
      }),
    );
  });

  // Quick-add button attaches the first open editor file
  it("アクティブエディタの quick-add ボタンで先頭ファイルが添付されること", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    // quick-add ボタン（最初の openEditor ファイル: main.ts）が表示される
    const quickAdd = screen.getByTitle("Add src/main.ts");
    expect(quickAdd).toBeInTheDocument();

    await user.click(quickAdd);

    // チップが表示される
    const chips = document.querySelectorAll(".attached-file-chip");
    expect(chips.length).toBe(1);
  });

  // Selecting the same file twice only attaches it once
  it("同じファイルを2回選択しても1つだけ添付されること", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    // quick-add で main.ts を添付
    await user.click(screen.getByTitle("Add src/main.ts"));
    expect(document.querySelectorAll(".attached-file-chip").length).toBe(1);

    // ファイルピッカーからもう一度 main.ts を選択しようとする
    await user.click(screen.getByTitle("Add context"));

    // main.ts は既に添付済みなのでピッカーのリストに表示されない（フィルタされている）
    const pickerItems = document.querySelectorAll(".file-picker-item");
    const mainInPicker = Array.from(pickerItems).find((el) => el.textContent?.includes("main.ts"));
    expect(mainInPicker).toBeFalsy();
  });

  // Escape closes the # popup
  it("# トリガー中に Escape でポップアップが閉じること", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "#");

    // ポップアップが開いている
    expect(document.querySelector(".hash-popup")).toBeTruthy();

    // Escape で閉じる
    await user.keyboard("{Escape}");
    expect(document.querySelector(".hash-popup")).toBeFalsy();
  });

  // Space input during # trigger terminates the trigger
  it("# トリガー中にスペース入力でトリガーが終了すること", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "#test ");

    // スペースを入力したのでポップアップが閉じる
    expect(document.querySelector(".hash-popup")).toBeFalsy();
  });
});
