import { useLocale } from "../../locales";
import type { FileAttachment } from "../../vscode-api";
import { ListItem } from "../atoms/ListItem";

type Props = {
  hashFiles: FileAttachment[];
  onAddFile: (file: FileAttachment) => void;
  hashPopupRef: React.RefObject<HTMLDivElement | null>;
};

export function HashFilePopup({ hashFiles, onAddFile, hashPopupRef }: Props) {
  const t = useLocale();

  return (
    <div className="hash-popup" ref={hashPopupRef}>
      {hashFiles.length > 0 ? (
        hashFiles.map((file) => (
          <ListItem
            key={file.filePath}
            title={file.fileName}
            description={file.filePath}
            onClick={() => onAddFile(file)}
          />
        ))
      ) : (
        <div className="hash-popup-empty">{t["input.noFiles"]}</div>
      )}
    </div>
  );
}
