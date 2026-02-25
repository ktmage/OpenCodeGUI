import { useLocale } from "../../locales";
import type { FileAttachment } from "../../vscode-api";

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
          <div key={file.filePath} className="hash-popup-item" onClick={() => onAddFile(file)}>
            <span className="hash-popup-item-name">{file.fileName}</span>
            <span className="hash-popup-item-path">{file.filePath}</span>
          </div>
        ))
      ) : (
        <div className="hash-popup-empty">{t["input.noFiles"]}</div>
      )}
    </div>
  );
}
