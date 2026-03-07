import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StreamingIndicator } from "../../../components/atoms/StreamingIndicator";

describe("StreamingIndicator", () => {
  // when rendered
  context("レンダリングした場合", () => {
    // renders the root container
    it("root コンテナをレンダリングすること", () => {
      const { container } = render(<StreamingIndicator />);
      expect(container.querySelector("[data-testid='streaming-indicator']")).toBeInTheDocument();
    });

    // renders exactly 3 dots
    it("ドットを 3 つレンダリングすること", () => {
      const { container } = render(<StreamingIndicator />);
      expect(container.querySelectorAll(".dot")).toHaveLength(3);
    });
  });
});
