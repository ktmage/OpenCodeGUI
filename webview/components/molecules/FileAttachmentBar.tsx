import { useLocale } from "../../locales";
import type { FileAttachment } from "../../vscode-api";
import { IconButton } from "../atoms/IconButton";
import { ClipIcon, CloseIcon, PlusIcon } from "../atoms/icons";

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
}: Props) {
  const t = useLocale();

  return (
    <div className="context-bar-left">
      {/* クリップボタン */}
      <div className="context-clip-container" ref={filePickerRef}>
        <IconButton variant="outlined" size="sm" onClick={onClipClick} title={t["input.addContext"]}>
          <ClipIcon />
        </IconButton>
        {showFilePicker && (
          <div className="file-picker-dropdown">
            <input
              className="file-picker-search"
              placeholder={t["input.searchFiles"]}
              value={filePickerQuery}
              onChange={(e) => onFilePickerSearch(e.target.value)}
            />
            <div className="file-picker-list">
              {pickerFiles.length > 0 ? (
                pickerFiles.slice(0, 15).map((file) => (
                  <div key={file.filePath} className="file-picker-item" onClick={() => onAddFile(file)}>
                    <span className="file-picker-item-name">{file.fileName}</span>
                    <span className="file-picker-item-path">{file.filePath}</span>
                  </div>
                ))
              ) : (
                <div className="file-picker-empty">{t["input.noFiles"]}</div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* 添付されたファイルチップ (インライン) */}
      {attachedFiles.map((file) => (
        <div key={file.filePath} className="attached-file-chip">
          <span className="attached-file-name">{file.fileName}</span>
          <button
            type="button"
            className="attached-file-remove"
            onClick={() => onRemoveFile(file.filePath)}
            title={t["input.remove"]}
          >
            <CloseIcon width={12} height={12} />
          </button>
        </div>
      ))}
      {/* 現在開いているファイルの quick-add ボタン */}
      {activeEditorFile && !isActiveAttached && (
        <button
          type="button"
          className="context-file-button"
          onClick={() => onAddFile(activeEditorFile)}
          title={t["input.addFile"](activeEditorFile.filePath)}
        >
          <PlusIcon />
          <span>{activeEditorFile.fileName}</span>
        </button>
      )}
    </div>
  );
}
