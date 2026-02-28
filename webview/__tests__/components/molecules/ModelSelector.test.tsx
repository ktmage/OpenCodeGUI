import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ModelSelector } from "../../../components/molecules/ModelSelector";
import { createProvider } from "../../factories";

const defaultProps = {
  providers: [
    createProvider("openai", {
      "gpt-4": { id: "gpt-4", name: "GPT-4", limit: { context: 128000, output: 4096 } },
    }),
  ],
  allProvidersData: null,
  selectedModel: { providerID: "openai", modelID: "gpt-4" },
  onSelect: vi.fn(),
};

describe("ModelSelector", () => {
  // when rendered
  context("レンダリングした場合", () => {
    // renders the selector button
    it("セレクターボタンをレンダリングすること", () => {
      const { container } = render(<ModelSelector {...defaultProps} />);
      expect(container.querySelector(".button")).toBeInTheDocument();
    });

    // shows selected model name
    it("選択中のモデル名を表示すること", () => {
      const { container } = render(<ModelSelector {...defaultProps} />);
      expect(container.querySelector(".label")?.textContent).toBe("GPT-4");
    });
  });

  // when button is clicked
  context("ボタンをクリックした場合", () => {
    // opens the model panel
    it("モデルパネルを開くこと", () => {
      const { container } = render(<ModelSelector {...defaultProps} />);
      fireEvent.click(container.querySelector(".button")!);
      expect(container.querySelector(".panel")).toBeInTheDocument();
    });
  });

  // when a model is selected
  context("モデルを選択した場合", () => {
    // calls onSelect with the model
    it("onSelect が呼ばれること", () => {
      const onSelect = vi.fn();
      const { container } = render(<ModelSelector {...defaultProps} onSelect={onSelect} />);
      fireEvent.click(container.querySelector(".button")!);
      fireEvent.click(container.querySelector(".item")!);
      expect(onSelect).toHaveBeenCalledWith({ providerID: "openai", modelID: "gpt-4" });
    });
  });

  // when no model is selected
  context("モデルが未選択の場合", () => {
    // shows placeholder text
    it("プレースホルダーテキストを表示すること", () => {
      const { container } = render(<ModelSelector {...defaultProps} selectedModel={null} />);
      expect(container.querySelector(".label")?.textContent).toBeTruthy();
    });
  });
});
