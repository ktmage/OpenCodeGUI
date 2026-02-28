import type { Provider } from "@opencode-ai/sdk";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import type { LocaleSetting } from "../../locales";
import { useLocale } from "../../locales";
import type { AllProvidersData, FileAttachment } from "../../vscode-api";
import { postMessage } from "../../vscode-api";
import { IconButton } from "../atoms/IconButton";
import {
  ChevronRightIcon,
  GearIcon,
  SendIcon,
  StopIcon,
  TerminalIcon,
} from "../atoms/icons";
import { ContextIndicator } from "../atoms/ContextIndicator";
import { FileAttachmentBar } from "../molecules/FileAttachmentBar";
import { HashFilePopup } from "../molecules/HashFilePopup";
import { ModelSelector } from "../molecules/ModelSelector";
import { ToolConfigPanel } from "../organisms/ToolConfigPanel";
import styles from "./InputArea.module.css";

type Props = {
  onSend: (text: string, files: FileAttachment[]) => void;
  onAbort: () => void;
  isBusy: boolean;
  providers: Provider[];
  allProvidersData: AllProvidersData | null;
  selectedModel: { providerID: string; modelID: string } | null;
  onModelSelect: (model: { providerID: string; modelID: string }) => void;
  openEditors: FileAttachment[];
  workspaceFiles: FileAttachment[];
  inputTokens: number;
  contextLimit: number;
  onCompress: () => void;
  isCompressing: boolean;
  prefillText?: string;
  onPrefillConsumed?: () => void;
  openCodePaths: { home: string; config: string; state: string; directory: string } | null;
  onOpenConfigFile: (filePath: string) => void;
  onOpenTerminal: () => void;
  localeSetting: LocaleSetting;
  onLocaleSettingChange: (setting: LocaleSetting) => void;
};

export function InputArea({
  onSend,
  onAbort,
  isBusy,
  providers,
  allProvidersData,
  selectedModel,
  onModelSelect,
  openEditors,
  workspaceFiles,
  inputTokens,
  contextLimit,
  onCompress,
  isCompressing,
  prefillText,
  onPrefillConsumed,
  openCodePaths,
  onOpenConfigFile,
  onOpenTerminal,
  localeSetting,
  onLocaleSettingChange,
}: Props) {
  const t = useLocale();
  const [text, setText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerQuery, setFilePickerQuery] = useState("");
  const [showToolConfig, setShowToolConfig] = useState(false);
  // # トリガー用
  const [hashTrigger, setHashTrigger] = useState<{ active: boolean; startIndex: number }>({
    active: false,
    startIndex: -1,
  });
  const [hashQuery, setHashQuery] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const filePickerRef = useRef<HTMLDivElement>(null);
  const hashPopupRef = useRef<HTMLDivElement>(null);

  // チェックポイントからの復元時にテキストをプリフィルする
  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      onPrefillConsumed?.();
      // テキストエリアの高さを調整してフォーカスする
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
          el.focus();
        }
      });
    }
  }, [prefillText, onPrefillConsumed]);

  // クリップボタンを押したときにエディタ一覧を取得してファイルピッカーを開く
  const handleClipClick = useCallback(() => {
    postMessage({ type: "getOpenEditors" });
    postMessage({ type: "searchWorkspaceFiles", query: "" });
    setShowFilePicker((s) => !s);
    setFilePickerQuery("");
  }, []);

  // ファイルピッカー内の検索
  const handleFilePickerSearch = useCallback((q: string) => {
    setFilePickerQuery(q);
    postMessage({ type: "searchWorkspaceFiles", query: q });
  }, []);

  // ファイルを添付する
  const addFile = useCallback(
    (file: FileAttachment) => {
      setAttachedFiles((prev) => {
        if (prev.some((f) => f.filePath === file.filePath)) return prev;
        return [...prev, file];
      });
      setShowFilePicker(false);
      // # トリガーの場合はテキストから #query を消す
      if (hashTrigger.active) {
        setText((prev) => {
          const before = prev.slice(0, hashTrigger.startIndex);
          const after = prev.slice(hashTrigger.startIndex + 1 + hashQuery.length);
          return before + after;
        });
        setHashTrigger({ active: false, startIndex: -1 });
        setHashQuery("");
      }
      textareaRef.current?.focus();
    },
    [hashTrigger, hashQuery],
  );

  // ファイルを添付解除する
  const removeFile = useCallback((filePath: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.filePath !== filePath));
  }, []);

  // 外部クリックでファイルピッカーを閉じる
  useClickOutside(filePickerRef, () => setShowFilePicker(false), showFilePicker);

  // 外部クリックで # ポップアップを閉じる（textarea 内のクリックは除外）
  useClickOutside(
    [hashPopupRef, textareaRef],
    () => {
      setHashTrigger({ active: false, startIndex: -1 });
      setHashQuery("");
    },
    hashTrigger.active,
  );

  // # トリガー: ワークスペースファイルを検索する
  useEffect(() => {
    if (hashTrigger.active) {
      postMessage({ type: "searchWorkspaceFiles", query: hashQuery });
    }
  }, [hashTrigger.active, hashQuery]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed, attachedFiles);
    setText("");
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, attachedFiles, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Escape で # ポップアップを閉じる
      if (e.key === "Escape" && hashTrigger.active) {
        setHashTrigger({ active: false, startIndex: -1 });
        setHashQuery("");
        return;
      }
      // IME 変換中は送信しない
      if (e.key === "Enter" && !e.shiftKey && !composingRef.current) {
        e.preventDefault();
        if (isBusy) return;
        // # ポップアップ表示中はファイル選択ではなく送信を優先
        if (hashTrigger.active) {
          setHashTrigger({ active: false, startIndex: -1 });
          setHashQuery("");
        }
        handleSend();
      }
    },
    [handleSend, isBusy, hashTrigger.active],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);

      // # トリガー検出
      const cursorPos = e.target.selectionStart;
      if (newText.length > text.length) {
        // 文字追加時
        const addedChar = newText[cursorPos - 1];
        if (
          addedChar === "#" &&
          (cursorPos === 1 || newText[cursorPos - 2] === " " || newText[cursorPos - 2] === "\n")
        ) {
          // # の前が空白・改行・先頭の場合にトリガーを開始
          setHashTrigger({ active: true, startIndex: cursorPos - 1 });
          setHashQuery("");
          postMessage({ type: "getOpenEditors" });
          return;
        }
      }

      // # トリガーがアクティブなら、クエリを更新する
      if (hashTrigger.active) {
        const queryPart = newText.slice(hashTrigger.startIndex + 1, cursorPos);
        // スペースまたは改行が含まれたらトリガー終了
        if (/[\s]/.test(queryPart) || cursorPos <= hashTrigger.startIndex) {
          setHashTrigger({ active: false, startIndex: -1 });
          setHashQuery("");
        } else {
          setHashQuery(queryPart);
        }
      }
    },
    [text, hashTrigger],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // ファイルピッカーに表示するリスト: 検索クエリがあればworkspaceFiles、なければopenEditors + workspaceFiles
  const pickerFiles = filePickerQuery
    ? workspaceFiles.filter((f) => !attachedFiles.some((a) => a.filePath === f.filePath))
    : [...openEditors, ...workspaceFiles.filter((f) => !openEditors.some((o) => o.filePath === f.filePath))].filter(
        (f) => !attachedFiles.some((a) => a.filePath === f.filePath),
      );

  // # トリガーのファイル候補
  const hashFiles = hashQuery
    ? workspaceFiles
        .filter(
          (f) =>
            f.fileName.toLowerCase().includes(hashQuery.toLowerCase()) ||
            f.filePath.toLowerCase().includes(hashQuery.toLowerCase()),
        )
        .filter((f) => !attachedFiles.some((a) => a.filePath === f.filePath))
        .slice(0, 10)
    : [...openEditors, ...workspaceFiles.filter((f) => !openEditors.some((o) => o.filePath === f.filePath))]
        .filter((f) => !attachedFiles.some((a) => a.filePath === f.filePath))
        .slice(0, 10);

  // 現在アクティブなエディタファイル (リストの先頭)
  const activeEditorFile = openEditors.length > 0 ? openEditors[0] : null;
  const isActiveAttached = activeEditorFile
    ? attachedFiles.some((f) => f.filePath === activeEditorFile.filePath)
    : false;

  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        {/* コンテキストバー: クリップボタン + 添付ファイルチップ + quick-add を1行に */}
        <div className={styles.contextBar}>
          <FileAttachmentBar
            attachedFiles={attachedFiles}
            activeEditorFile={activeEditorFile}
            isActiveAttached={isActiveAttached}
            showFilePicker={showFilePicker}
            filePickerQuery={filePickerQuery}
            pickerFiles={pickerFiles}
            onClipClick={handleClipClick}
            onFilePickerSearch={handleFilePickerSearch}
            onAddFile={addFile}
            onRemoveFile={removeFile}
            filePickerRef={filePickerRef}
          />
          {/* コンテキストウィンドウ使用率インジケーター (右側) */}
          {contextLimit > 0 && (
            <ContextIndicator
              inputTokens={inputTokens}
              contextLimit={contextLimit}
              onCompress={onCompress}
              isCompressing={isCompressing}
            />
          )}
        </div>

        {/* テキスト入力エリア（# ポップアップ付き） */}
        <div className={styles.textareaContainer}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={t["input.placeholder"]}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
            }}
            rows={1}
          />
          {/* # トリガー ファイル候補ポップアップ */}
          {hashTrigger.active && (
            <HashFilePopup hashFiles={hashFiles} onAddFile={addFile} hashPopupRef={hashPopupRef} />
          )}
        </div>

        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            <ModelSelector
              providers={providers}
              allProvidersData={allProvidersData}
              selectedModel={selectedModel}
              onSelect={onModelSelect}
            />
            <IconButton variant="muted" onClick={onOpenTerminal} title={t["input.openTerminal"]}>
              <TerminalIcon />
            </IconButton>
            <IconButton variant="muted" onClick={() => setShowToolConfig((s) => !s)} title={t["input.settings"]}>
              <GearIcon />
              <span className={`${styles.chevron} ${showToolConfig ? styles.expanded : ""}`}>
                <ChevronRightIcon />
              </span>
            </IconButton>
            {showToolConfig && (
              <ToolConfigPanel
                paths={openCodePaths}
                onOpenConfigFile={onOpenConfigFile}
                onClose={() => setShowToolConfig(false)}
                localeSetting={localeSetting}
                onLocaleSettingChange={onLocaleSettingChange}
              />
            )}
          </div>
          {isBusy ? (
            <IconButton className={styles.sendButton} onClick={onAbort} title={t["input.stop"]}>
              <StopIcon />
            </IconButton>
          ) : (
            <IconButton
              className={styles.sendButton}
              onClick={handleSend}
              disabled={!text.trim()}
              title={t["input.send"]}
            >
              <SendIcon />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
}
