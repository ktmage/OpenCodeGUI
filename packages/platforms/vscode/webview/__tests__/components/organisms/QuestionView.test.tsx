import type { QuestionRequest } from "@opencodegui/core";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionView } from "../../../components/organisms/QuestionView";
import { postMessage } from "../../../vscode-api";

function createQuestionRequest(overrides: Partial<QuestionRequest> = {}): QuestionRequest {
  return {
    id: "req-1",
    sessionID: "session-1",
    questions: [
      {
        question: "Which tool do you want to use?",
        header: "Tool selection",
        options: [
          { label: "Bash", description: "Run shell commands" },
          { label: "Python", description: "Run Python scripts" },
        ],
      },
    ],
    ...overrides,
  };
}

describe("QuestionView", () => {
  // when rendered with a single question
  context("単一質問でレンダリングした場合", () => {
    // renders the question header
    it("質問ヘッダーを表示すること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      expect(container.textContent).toContain("Tool selection");
    });

    // renders the question text
    it("質問テキストを表示すること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      expect(container.textContent).toContain("Which tool do you want to use?");
    });

    // renders option labels
    it("選択肢のラベルを表示すること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      expect(container.textContent).toContain("Bash");
      expect(container.textContent).toContain("Python");
    });

    // renders option descriptions
    it("選択肢の説明を表示すること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      expect(container.textContent).toContain("Run shell commands");
      expect(container.textContent).toContain("Run Python scripts");
    });

    // renders submit and reject buttons
    it("送信ボタンと拒否ボタンを表示すること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      expect(container.textContent).toContain("Submit");
      expect(container.textContent).toContain("Reject");
    });

    // renders custom text input by default
    it("カスタムテキスト入力をデフォルトで表示すること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      const input = container.querySelector("input[type='text']");
      expect(input).toBeTruthy();
    });
  });

  // when custom is false
  context("custom が false の場合", () => {
    // does not render custom text input
    it("カスタムテキスト入力を表示しないこと", () => {
      const question = createQuestionRequest({
        questions: [
          {
            question: "Pick one",
            header: "Selection",
            options: [{ label: "A", description: "" }],
            custom: false,
          },
        ],
      });
      const { container } = render(<QuestionView question={question} />);
      const input = container.querySelector("input[type='text']");
      expect(input).toBeNull();
    });
  });

  // single selection mode
  context("単一選択モードの場合", () => {
    // selects an option on click
    it("クリックで選択肢を選択できること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      const buttons = container.querySelectorAll("button");
      // option buttons come first, then submit/reject
      const optionButton = buttons[0]!;
      fireEvent.click(optionButton);
      expect(optionButton.className).toContain("selected");
    });

    // deselects on second click
    it("再クリックで選択解除されること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      const buttons = container.querySelectorAll("button");
      const optionButton = buttons[0]!;
      fireEvent.click(optionButton);
      fireEvent.click(optionButton);
      expect(optionButton.className).not.toContain("selected");
    });

    // only one option is selected at a time
    it("1つだけ選択されること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[0]!);
      fireEvent.click(buttons[1]!);
      expect(buttons[0]!.className).not.toContain("selected");
      expect(buttons[1]!.className).toContain("selected");
    });
  });

  // multiple selection mode
  context("複数選択モードの場合", () => {
    const multiQuestion = createQuestionRequest({
      questions: [
        {
          question: "Select tools",
          header: "Multi select",
          options: [
            { label: "A", description: "" },
            { label: "B", description: "" },
          ],
          multiple: true,
        },
      ],
    });

    // allows selecting multiple options
    it("複数の選択肢を選択できること", () => {
      const { container } = render(<QuestionView question={multiQuestion} />);
      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[0]!);
      fireEvent.click(buttons[1]!);
      expect(buttons[0]!.className).toContain("selected");
      expect(buttons[1]!.className).toContain("selected");
    });

    // allows deselecting one option
    it("1つだけ選択解除できること", () => {
      const { container } = render(<QuestionView question={multiQuestion} />);
      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[0]!);
      fireEvent.click(buttons[1]!);
      fireEvent.click(buttons[0]!);
      expect(buttons[0]!.className).not.toContain("selected");
      expect(buttons[1]!.className).toContain("selected");
    });
  });

  // submit button
  context("送信ボタンをクリックした場合", () => {
    // sends replyQuestion with selected answers
    it("replyQuestion メッセージを送信すること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      const buttons = container.querySelectorAll("button");
      // select first option (Bash)
      fireEvent.click(buttons[0]!);
      // click submit (the third button after two option buttons)
      fireEvent.click(buttons[2]!);
      expect(postMessage).toHaveBeenCalledWith({
        type: "replyQuestion",
        requestId: "req-1",
        answers: [["Bash"]],
      });
    });

    // includes custom text in answers when provided
    it("カスタムテキストが回答に含まれること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      const input = container.querySelector("input[type='text']") as HTMLInputElement;
      fireEvent.change(input, { target: { value: "Custom tool" } });
      // click submit
      const buttons = container.querySelectorAll("button");
      fireEvent.click(buttons[2]!);
      expect(postMessage).toHaveBeenCalledWith({
        type: "replyQuestion",
        requestId: "req-1",
        answers: [["Custom tool"]],
      });
    });
  });

  // reject button
  context("拒否ボタンをクリックした場合", () => {
    // sends rejectQuestion message
    it("rejectQuestion メッセージを送信すること", () => {
      const { container } = render(<QuestionView question={createQuestionRequest()} />);
      const buttons = container.querySelectorAll("button");
      // reject is the last button (after 2 option buttons + submit)
      fireEvent.click(buttons[3]!);
      expect(postMessage).toHaveBeenCalledWith({
        type: "rejectQuestion",
        requestId: "req-1",
      });
    });
  });
});
