import { useLocale } from "../../../locales";
import type { FileAttachment } from "../../../vscode-api";
import { IconButton } from "../../atoms/IconButton";
import { ListItem } from "../../atoms/ListItem";
import { ClipIcon, CloseIcon, PlusIcon } from "../../atoms/icons";
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
    <div className={styles.left}>
      {/* クリップボタン */}
      <div className={styles.clipContainer} ref={filePickerRef}>
        <IconButton variant="outlined" size="sm" onClick={onClipClick} title={t["input.addContext"]}>
          <ClipIcon />
        </IconButton>
        {showFilePicker && (
          <div className={styles.pickerDropdown}>
            <input
              className={styles.pickerSearch}
              placeholder={t["input.searchFiles"]}
              value={filePickerQuery}
              onChange={(e) => onFilePickerSearch(e.target.value)}
            />
            <div className={styles.pickerList}>
              {pickerFiles.length > 0 ? (
                pickerFiles.slice(0, 15).map((file) => (
                  <ListItem
                    key={file.filePath}
                    title={file.fileName}
                    description={file.filePath}
                    onClick={() => onAddFile(file)}
                  />
                ))
              ) : (
                <div className={styles.pickerEmpty}>{t["input.noFiles"]}</div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* 添付されたファイルチップ (インライン) */}
      {attachedFiles.map((file) => (
        <div key={file.filePath} className={styles.chip}>
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
      ))}
      {/* 現在開いているファイルの quick-add ボタン */}
      {activeEditorFile && !isActiveAttached && (
        <button
          type="button"
          className={styles.fileButton}
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
