import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileAttachmentBar } from "../../../components/molecules/FileAttachmentBar";
import type { FileAttachment } from "../../../vscode-api";

const file1: FileAttachment = { fileName: "app.tsx", filePath: "/src/app.tsx" };
const file2: FileAttachment = { fileName: "index.ts", filePath: "/src/index.ts" };

function createRef() {
  return { current: null } as React.RefObject<HTMLDivElement | null>;
}

const defaultProps = {
  attachedFiles: [] as FileAttachment[],
  activeEditorFile: null,
  isActiveAttached: false,
  showFilePicker: false,
  filePickerQuery: "",
  pickerFiles: [] as FileAttachment[],
  onClipClick: vi.fn(),
  onFilePickerSearch: vi.fn(),
  onAddFile: vi.fn(),
  onRemoveFile: vi.fn(),
  filePickerRef: createRef(),
};

describe("FileAttachmentBar", () => {
  // when rendered with default props
  context("デフォルト props の場合", () => {
    // renders clip button
    it("クリップボタンをレンダリングすること", () => {
      const { container } = render(<FileAttachmentBar {...defaultProps} />);
      expect(container.querySelector(".outlined")).toBeInTheDocument();
    });
  });

  // when clip button is clicked
  context("クリップボタンをクリックした場合", () => {
    // calls onClipClick
    it("onClipClick が呼ばれること", () => {
      const onClipClick = vi.fn();
      const { container } = render(<FileAttachmentBar {...defaultProps} onClipClick={onClipClick} />);
      fireEvent.click(container.querySelector(".outlined")!);
      expect(onClipClick).toHaveBeenCalledOnce();
    });
  });

  // when files are attached
  context("ファイルが添付されている場合", () => {
    // renders attached file chips
    it("添付ファイルチップをレンダリングすること", () => {
      const { container } = render(<FileAttachmentBar {...defaultProps} attachedFiles={[file1, file2]} />);
      expect(container.querySelectorAll(".chip")).toHaveLength(2);
    });

    // calls onRemoveFile when remove button is clicked
    it("削除ボタンクリックで onRemoveFile が呼ばれること", () => {
      const onRemoveFile = vi.fn();
      const { container } = render(
        <FileAttachmentBar {...defaultProps} attachedFiles={[file1]} onRemoveFile={onRemoveFile} />,
      );
      fireEvent.click(container.querySelector(".chipRemove")!);
      expect(onRemoveFile).toHaveBeenCalledWith(file1.filePath);
    });
  });

  // when activeEditorFile is set and not attached
  context("アクティブエディタファイルが設定され未添付の場合", () => {
    // renders quick-add button
    it("quick-add ボタンをレンダリングすること", () => {
      const { container } = render(
        <FileAttachmentBar {...defaultProps} activeEditorFile={file1} isActiveAttached={false} />,
      );
      expect(container.querySelector(".fileButton")).toBeInTheDocument();
    });
  });

  // when activeEditorFile is already attached
  context("アクティブエディタファイルが既に添付済みの場合", () => {
    // does not render quick-add button
    it("quick-add ボタンをレンダリングしないこと", () => {
      const { container } = render(
        <FileAttachmentBar {...defaultProps} activeEditorFile={file1} isActiveAttached={true} />,
      );
      expect(container.querySelector(".fileButton")).not.toBeInTheDocument();
    });
  });

  // when file picker is open
  context("ファイルピッカーが開いている場合", () => {
    // renders the dropdown
    it("ドロップダウンをレンダリングすること", () => {
      const { container } = render(
        <FileAttachmentBar {...defaultProps} showFilePicker={true} pickerFiles={[file1]} />,
      );
      expect(container.querySelector(".pickerDropdown")).toBeInTheDocument();
    });
  });
});
