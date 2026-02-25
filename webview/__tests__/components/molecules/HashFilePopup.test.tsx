import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HashFilePopup } from "../../../components/molecules/HashFilePopup";
import type { FileAttachment } from "../../../vscode-api";

const file1: FileAttachment = { fileName: "app.tsx", filePath: "/src/app.tsx" };
const file2: FileAttachment = { fileName: "index.ts", filePath: "/src/index.ts" };

function createRef() {
  return { current: null } as React.RefObject<HTMLDivElement | null>;
}

describe("HashFilePopup", () => {
  // when files are available
  context("ファイル候補がある場合", () => {
    // renders file items
    it("ファイルアイテムをレンダリングすること", () => {
      const { container } = render(
        <HashFilePopup hashFiles={[file1, file2]} onAddFile={vi.fn()} hashPopupRef={createRef()} />,
      );
      expect(container.querySelectorAll(".hash-popup-item")).toHaveLength(2);
    });

    // calls onAddFile when item is clicked
    it("アイテムクリックで onAddFile が呼ばれること", () => {
      const onAddFile = vi.fn();
      const { container } = render(
        <HashFilePopup hashFiles={[file1]} onAddFile={onAddFile} hashPopupRef={createRef()} />,
      );
      fireEvent.click(container.querySelector(".hash-popup-item")!);
      expect(onAddFile).toHaveBeenCalledWith(file1);
    });
  });

  // when no files match
  context("ファイル候補がない場合", () => {
    // renders empty message
    it("空メッセージを表示すること", () => {
      const { container } = render(
        <HashFilePopup hashFiles={[]} onAddFile={vi.fn()} hashPopupRef={createRef()} />,
      );
      expect(container.querySelector(".hash-popup-empty")).toBeInTheDocument();
    });
  });
});
