import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FileAttachmentBar } from "../../../components/molecules/FileAttachmentBar";
import type { FileAttachment } from "../../../vscode-api";

const file1: FileAttachment = { fileName: "app.tsx", filePath: "/src/app.tsx" };
const file2: FileAttachment = { fileName: "index.ts", filePath: "/src/index.ts" };

const agent1 = { name: "coder", description: "Code assistant", mode: "subagent" } as any;
const agent2 = { name: "reviewer", description: "Code reviewer", mode: "subagent" } as any;

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
  agents: [] as any[],
  selectedAgent: null,
  onSelectAgent: vi.fn(),
  isShellMode: false,
  onToggleShellMode: vi.fn(),
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
      const { container } = render(<FileAttachmentBar {...defaultProps} showFilePicker={true} pickerFiles={[file1]} />);
      expect(container.querySelector(".pickerDropdown")).toBeInTheDocument();
    });

    // renders three sections: Files, Agents, Shell Mode
    it("3 つのセクション（Files, Agents, Shell Mode）を表示すること", () => {
      render(
        <FileAttachmentBar {...defaultProps} showFilePicker={true} pickerFiles={[file1]} agents={[agent1, agent2]} />,
      );
      expect(screen.getByText("Files")).toBeInTheDocument();
      expect(screen.getByText("Agents")).toBeInTheDocument();
      expect(screen.getByText("Shell Mode")).toBeInTheDocument();
    });
  });

  // when agent is clicked in the dropdown
  context("ドロップダウンでエージェントをクリックした場合", () => {
    // calls onSelectAgent
    it("onSelectAgent が呼ばれること", async () => {
      const onSelectAgent = vi.fn();
      render(
        <FileAttachmentBar
          {...defaultProps}
          showFilePicker={true}
          agents={[agent1, agent2]}
          onSelectAgent={onSelectAgent}
        />,
      );
      const user = userEvent.setup();
      await user.click(screen.getByText("coder"));
      expect(onSelectAgent).toHaveBeenCalledWith(agent1);
    });
  });

  // when shell toggle is clicked
  context("シェルモードトグルをクリックした場合", () => {
    // calls onToggleShellMode
    it("onToggleShellMode が呼ばれること", async () => {
      const onToggleShellMode = vi.fn();
      render(<FileAttachmentBar {...defaultProps} showFilePicker={true} onToggleShellMode={onToggleShellMode} />);
      const user = userEvent.setup();
      await user.click(screen.getByTestId("shell-toggle"));
      expect(onToggleShellMode).toHaveBeenCalledOnce();
    });
  });

  // when isShellMode is true
  context("シェルモードが ON の場合", () => {
    // file section is disabled
    it("ファイルセクションが無効化されること", () => {
      const { container } = render(
        <FileAttachmentBar
          {...defaultProps}
          showFilePicker={true}
          pickerFiles={[file1]}
          agents={[agent1]}
          isShellMode={true}
        />,
      );
      const disabledSections = container.querySelectorAll(".sectionDisabled");
      expect(disabledSections.length).toBe(2);
    });

    // toggle track has toggleOn class
    it("トグルが ON 状態で表示されること", () => {
      const { container } = render(<FileAttachmentBar {...defaultProps} showFilePicker={true} isShellMode={true} />);
      expect(container.querySelector(".toggleOn")).toBeInTheDocument();
    });
  });
});
