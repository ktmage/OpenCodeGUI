import { useLocale } from "../../../locales";
import type { FileAttachment } from "../../../vscode-api";
import { ListItem } from "../../atoms/ListItem";
import styles from "./HashFilePopup.module.css";

type Props = {
  hashFiles: FileAttachment[];
  onAddFile: (file: FileAttachment) => void;
  hashPopupRef: React.RefObject<HTMLDivElement | null>;
  focusedIndex: number;
};

export function HashFilePopup({ hashFiles, onAddFile, hashPopupRef, focusedIndex }: Props) {
  const t = useLocale();

  return (
    <div className={styles.root} ref={hashPopupRef} data-testid="hash-popup">
      {hashFiles.length > 0 ? (
        hashFiles.map((file, i) => (
          <ListItem
            key={file.filePath}
            title={file.fileName}
            description={file.filePath}
            onClick={() => onAddFile(file)}
            focused={i === focusedIndex}
          />
        ))
      ) : (
        <div className={styles.empty}>{t["input.noFiles"]}</div>
      )}
    </div>
  );
}
