import type { Agent } from "@opencode-ai/sdk";
import { useLocale } from "../../../locales";
import { getFileIcon } from "../../../utils/file-icons";
import type { FileAttachment } from "../../../vscode-api";
import { IconButton } from "../../atoms/IconButton";
import { AgentIcon, ClipIcon, CloseIcon, PlusIcon, TerminalIcon } from "../../atoms/icons";
import { ListItem } from "../../atoms/ListItem";
import styles from "./FileAttachmentBar.module.css";

type Props = {
  attachedFiles: FileAttachment[];
  activeEditorFile: FileAttachment | null;
  isActiveAttached: boolean;
  showFilePicker: boolean;
  filePickerQuery: string;
  pickerFiles: FileAttachment[];
  onClipClick: () => void;
  onFilePickerSearch: (query: string) => void;
  onAddFile: (file: FileAttachment) => void;
  onRemoveFile: (filePath: string) => void;
  filePickerRef: React.RefObject<HTMLDivElement | null>;
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  isShellMode: boolean;
  onToggleShellMode: () => void;
};

export function FileAttachmentBar({
  attachedFiles,
  activeEditorFile,
  isActiveAttached,
  showFilePicker,
  filePickerQuery,
  pickerFiles,
  onClipClick,
  onFilePickerSearch,
  onAddFile,
  onRemoveFile,
  filePickerRef,
  agents,
  selectedAgent,
  onSelectAgent,
  isShellMode,
  onToggleShellMode,
}: Props) {
  const t = useLocale();

  return (
    <div className={styles.left}>
      {/* クリップボタン */}
      <div className={styles.clipContainer} ref={filePickerRef}>
        <IconButton
          variant="outlined"
          size="sm"
          active={showFilePicker}
          onClick={onClipClick}
          title={t["input.addContext"]}
        >
          <ClipIcon />
        </IconButton>
        {showFilePicker && (
          <div className={styles.pickerDropdown}>
            {/* ファイルセクション */}
            <div className={isShellMode ? styles.sectionDisabled : undefined}>
              <div className={styles.sectionHeader}>{t["input.section.files"]}</div>
              <input
                className={styles.pickerSearch}
                placeholder={t["input.searchFiles"]}
                value={filePickerQuery}
                onChange={(e) => onFilePickerSearch(e.target.value)}
                disabled={isShellMode}
              />
              <div className={styles.pickerList}>
                {pickerFiles.length > 0 ? (
                  pickerFiles.slice(0, 15).map((file) => {
                    const FileIcon = getFileIcon(file.fileName);
                    return (
                      <ListItem
                        key={file.filePath}
                        title={file.fileName}
                        description={file.filePath}
                        icon={<FileIcon width={14} height={14} />}
                        onClick={() => onAddFile(file)}
                      />
                    );
                  })
                ) : (
                  <div className={styles.pickerEmpty}>{t["input.noFiles"]}</div>
                )}
              </div>
            </div>

            {/* エージェントセクション */}
            <div className={isShellMode ? styles.sectionDisabled : undefined}>
              <div className={styles.sectionDivider} />
              <div className={styles.sectionHeader}>{t["input.section.agents"]}</div>
              <div className={styles.pickerList}>
                {agents.length > 0 ? (
                  agents.map((agent) => (
                    <ListItem
                      key={agent.name}
                      title={agent.name}
                      description={agent.description}
                      onClick={() => onSelectAgent(agent)}
                      focused={selectedAgent?.name === agent.name}
                    />
                  ))
                ) : (
                  <div className={styles.pickerEmpty}>{t["input.noAgents"]}</div>
                )}
              </div>
            </div>

            {/* シェルモードセクション */}
            <div className={styles.sectionDivider} />
            <div className={styles.sectionHeader}>{t["input.section.shell"]}</div>
            <button type="button" className={styles.toggleRow} onClick={onToggleShellMode} data-testid="shell-toggle">
              <TerminalIcon />
              <span className={styles.toggleLabel}>{t["input.shellMode"]}</span>
              <div className={`${styles.toggleTrack} ${isShellMode ? styles.toggleOn : ""}`}>
                <div className={styles.toggleThumb} />
              </div>
            </button>
          </div>
        )}
      </div>
      {/* 添付されたファイルチップ (インライン) */}
      {attachedFiles.map((file) => {
        const ChipIcon = getFileIcon(file.fileName);
        return (
          <div key={file.filePath} className={styles.chip}>
            <span className={styles.chipIcon}>
              <ChipIcon width={14} height={14} />
            </span>
            <span className={styles.chipName}>{file.fileName}</span>
            <button
              type="button"
              className={styles.chipRemove}
              onClick={() => onRemoveFile(file.filePath)}
              title={t["input.remove"]}
            >
              <CloseIcon width={12} height={12} />
            </button>
          </div>
        );
      })}
      {/* 現在開いているファイルの quick-add ボタン */}
      {activeEditorFile &&
        !isActiveAttached &&
        (() => {
          const QuickAddIcon = getFileIcon(activeEditorFile.fileName);
          return (
            <button
              type="button"
              className={styles.fileButton}
              onClick={() => onAddFile(activeEditorFile)}
              title={t["input.addFile"](activeEditorFile.filePath)}
            >
              <PlusIcon />
              <QuickAddIcon width={12} height={12} />
              <span>{activeEditorFile.fileName}</span>
            </button>
          );
        })()}
    </div>
  );
}
