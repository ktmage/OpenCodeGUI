import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { createMessage, createSession, createTextPart } from "../factories";
import { renderApp, sendExtMessage } from "../helpers";

/**
 * summary フィールド付きのユーザーメッセージを含むセッションをセットアップする。
 * SDK の UserMessage.summary は各ターンの人間向けダイジェストで、圧縮（compress）とは独立した機能。
 */
async function setupWithSummaries() {
  renderApp();

  const session = createSession({ id: "s-sum" });
  await sendExtMessage({ type: "activeSession", session });

  const userMsg1 = createMessage({
    id: "u1",
    sessionID: "s-sum",
    role: "user",
    summary: {
      title: "Project setup",
      body: "Created initial project structure with package.json and tsconfig",
      diffs: [
        { file: "package.json", before: "", after: "{}", additions: 10, deletions: 0 },
        { file: "tsconfig.json", before: "", after: "{}", additions: 5, deletions: 0 },
      ],
    },
  });
  const assistantMsg1 = createMessage({ id: "a1", sessionID: "s-sum", role: "assistant" });
  const textPart1 = createTextPart("Done!", { messageID: "a1" });

  const userMsg2 = createMessage({
    id: "u2",
    sessionID: "s-sum",
    role: "user",
    summary: {
      title: "Add linter",
      body: "Configured ESLint with recommended rules",
      diffs: [{ file: ".eslintrc.json", before: "", after: "{}", additions: 20, deletions: 0 }],
    },
  });
  const assistantMsg2 = createMessage({ id: "a2", sessionID: "s-sum", role: "assistant" });
  const textPart2 = createTextPart("Linter configured.", { messageID: "a2" });

  await sendExtMessage({
    type: "messages",
    sessionId: "s-sum",
    messages: [
      { info: userMsg1, parts: [] },
      { info: assistantMsg1, parts: [textPart1] },
      { info: userMsg2, parts: [] },
      { info: assistantMsg2, parts: [textPart2] },
    ],
  });

  return session;
}

/** summary フィールドを持たないメッセージのセッションをセットアップする */
async function setupWithoutSummaries() {
  renderApp();

  const session = createSession({ id: "s-nosum" });
  await sendExtMessage({ type: "activeSession", session });

  const userMsg = createMessage({ id: "u-no", sessionID: "s-nosum", role: "user" });
  const assistantMsg = createMessage({ id: "a-no", sessionID: "s-nosum", role: "assistant" });
  const textPart = createTextPart("Hello!", { messageID: "a-no" });

  await sendExtMessage({
    type: "messages",
    sessionId: "s-nosum",
    messages: [
      { info: userMsg, parts: [] },
      { info: assistantMsg, parts: [textPart] },
    ],
  });

  return session;
}

// Session Summary Display
describe("セッション要約表示", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // Summary button appears when summaries exist
  context("要約データがある場合", () => {
    it("ChatHeader に要約ボタンが表示されること", async () => {
      await setupWithSummaries();
      expect(screen.getByTitle("Show summary")).toBeInTheDocument();
    });
  });

  // Summary button is hidden when no summaries
  context("要約データがない場合", () => {
    it("ChatHeader に要約ボタンが表示されないこと", async () => {
      await setupWithoutSummaries();
      expect(screen.queryByTitle("Show summary")).not.toBeInTheDocument();
    });
  });

  // Clicking summary button shows the summary section
  context("要約ボタンをクリックした場合", () => {
    it("要約セクションが表示されること", async () => {
      await setupWithSummaries();
      fireEvent.click(screen.getByTitle("Show summary"));
      // SummaryHeader の bar が表示される
      expect(document.querySelector(".bar")).toBeInTheDocument();
    });

    it("要約の件数が表示されること", async () => {
      await setupWithSummaries();
      fireEvent.click(screen.getByTitle("Show summary"));
      expect(document.querySelector(".count")?.textContent).toBe("2");
    });
  });

  // Expanding the summary section shows individual summaries
  context("要約セクションを展開した場合", () => {
    it("各要約のタイトルが表示されること", async () => {
      await setupWithSummaries();
      // 1. Show summary section
      fireEvent.click(screen.getByTitle("Show summary"));
      // 2. Expand summary list
      fireEvent.click(document.querySelector(".bar")!);
      const titles = document.querySelectorAll(".itemTitle");
      expect(titles).toHaveLength(2);
      expect(titles[0]?.textContent).toBe("Project setup");
      expect(titles[1]?.textContent).toBe("Add linter");
    });

    it("各要約の本文が表示されること", async () => {
      await setupWithSummaries();
      fireEvent.click(screen.getByTitle("Show summary"));
      fireEvent.click(document.querySelector(".bar")!);
      const bodies = document.querySelectorAll(".itemBody");
      expect(bodies[0]?.textContent).toBe("Created initial project structure with package.json and tsconfig");
    });

    it("ファイル変更統計が表示されること", async () => {
      await setupWithSummaries();
      fireEvent.click(screen.getByTitle("Show summary"));
      fireEvent.click(document.querySelector(".bar")!);
      const stats = document.querySelectorAll(".itemStats");
      expect(stats).toHaveLength(2);
      // First summary: 2 files, +15, -0
      expect(stats[0]?.querySelector(".itemFiles")?.textContent).toContain("2");
      expect(stats[0]?.querySelector(".statAdd")?.textContent).toBe("+15");
    });
  });

  // Clicking summary button again hides the section
  context("要約ボタンを再度クリックした場合", () => {
    it("要約セクションが非表示になること", async () => {
      await setupWithSummaries();
      const btn = screen.getByTitle("Show summary");
      fireEvent.click(btn);
      expect(document.querySelector(".root")).toBeInTheDocument();
      fireEvent.click(btn);
      // SummaryHeader root should be gone
      // Note: other .root elements may exist (e.g., ChatHeader), so check for summary-specific content
      expect(document.querySelector(".count")).not.toBeInTheDocument();
    });
  });
});
