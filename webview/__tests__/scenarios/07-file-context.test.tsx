import { describe, it, expect, vi } from "vitest";
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

describe("07 ファイルコンテキスト", () => {
  it("クリップボタンでファイルピッカーが開く", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    await user.click(screen.getByTitle("Add context"));

    // ファイル一覧が表示される
    expect(screen.getByPlaceholderText("Search files...")).toBeInTheDocument();
  });

  it("ファイルを選択するとチップが表示されピッカーが閉じる", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    await user.click(screen.getByTitle("Add context"));

    // main.ts をクリック
    const items = screen.getAllByText("main.ts");
    // ファイルピッカー内のアイテムをクリック
    const pickerItem = items.find((el) => el.closest(".file-picker-item"));
    expect(pickerItem).toBeTruthy();
    await user.click(pickerItem!.closest(".file-picker-item")!);

    // チップが表示される
    const chips = document.querySelectorAll(".attached-file-chip");
    expect(chips.length).toBe(1);

    // ピッカーが閉じている
    expect(screen.queryByPlaceholderText("Search files...")).not.toBeInTheDocument();
  });

  it("チップの削除ボタンでファイルが除去される", async () => {
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

  it("# トリガーでファイル候補ポップアップが表示される", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "#");

    // ハッシュポップアップが表示される
    const popup = document.querySelector(".hash-popup");
    expect(popup).toBeTruthy();
  });

  it("# クエリでファイルがフィルタされ searchWorkspaceFiles が送信される", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "#config");

    expect(postMessage).toHaveBeenCalledWith({
      type: "searchWorkspaceFiles",
      query: "config",
    });
  });

  it("# からファイル選択でテキストから # 部分が除去されファイルが添付される", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "Look at #");

    // ポップアップからファイルを選択
    const popup = document.querySelector(".hash-popup");
    expect(popup).toBeTruthy();
    const popupItem = popup!.querySelector(".hash-popup-item");
    expect(popupItem).toBeTruthy();
    await user.click(popupItem!);

    // テキストから "#" が除去される
    expect(textarea).toHaveValue("Look at ");

    // チップが表示される
    expect(document.querySelectorAll(".attached-file-chip").length).toBe(1);
  });

  it("添付ファイル付きメッセージ送信で files が含まれる", async () => {
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

  it("アクティブエディタの quick-add ボタンで先頭ファイルが添付される", async () => {
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

  it("同じファイルを2回選択しても1つだけ添付される", async () => {
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

  it("# トリガー中に Escape でポップアップが閉じる", async () => {
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

  it("# トリガー中にスペース入力でトリガーが終了する", async () => {
    await setupWithFiles();
    const user = userEvent.setup();

    const textarea = screen.getByPlaceholderText("Ask OpenCode... (type # to attach files)");
    await user.type(textarea, "#test ");

    // スペースを入力したのでポップアップが閉じる
    expect(document.querySelector(".hash-popup")).toBeFalsy();
  });
});
