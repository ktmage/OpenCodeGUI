import { useState, useRef, useCallback, useEffect, type KeyboardEvent, type CompositionEvent } from "react";
import type { Provider } from "@opencode-ai/sdk";
import type { FileAttachment, AllProvidersData } from "../vscode-api";
import { postMessage } from "../vscode-api";
import { useLocale } from "../locales";
import type { LocaleSetting } from "../locales";
import { ModelSelector } from "./ModelSelector";
import { ContextIndicator } from "./ContextIndicator";
import { ToolConfigPanel } from "./ToolConfigPanel";
import type { McpStatus } from "@opencode-ai/sdk";

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
  onSend, onAbort, isBusy, providers, allProvidersData, selectedModel, onModelSelect,
  openEditors, workspaceFiles, inputTokens, contextLimit, onCompress, isCompressing,
  prefillText, onPrefillConsumed,
  openCodePaths, onOpenConfigFile, onOpenTerminal,
  localeSetting, onLocaleSettingChange,
}: Props) {
  const t = useLocale();
  const [text, setText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerQuery, setFilePickerQuery] = useState("");
  const [showToolConfig, setShowToolConfig] = useState(false);
  // # トリガー用
  const [hashTrigger, setHashTrigger] = useState<{ active: boolean; startIndex: number }>({ active: false, startIndex: -1 });
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
  }, [prefillText]);

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
  const addFile = useCallback((file: FileAttachment) => {
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
  }, [hashTrigger, hashQuery]);

  // ファイルを添付解除する
  const removeFile = useCallback((filePath: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.filePath !== filePath));
  }, []);

  // 外部クリックでファイルピッカーを閉じる
  useEffect(() => {
    if (!showFilePicker) return;
    const handler = (e: MouseEvent) => {
      if (filePickerRef.current && !filePickerRef.current.contains(e.target as Node)) {
        setShowFilePicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFilePicker]);

  // 外部クリックで # ポップアップを閉じる
  useEffect(() => {
    if (!hashTrigger.active) return;
    const handler = (e: MouseEvent) => {
      if (hashPopupRef.current && !hashPopupRef.current.contains(e.target as Node) &&
          textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setHashTrigger({ active: false, startIndex: -1 });
        setHashQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [hashTrigger.active]);

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

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // # トリガー検出
    const cursorPos = e.target.selectionStart;
    if (newText.length > text.length) {
      // 文字追加時
      const addedChar = newText[cursorPos - 1];
      if (addedChar === "#" && (cursorPos === 1 || newText[cursorPos - 2] === " " || newText[cursorPos - 2] === "\n")) {
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
  }, [text, hashTrigger]);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  // ファイルピッカーに表示するリスト: 検索クエリがあればworkspaceFiles、なければopenEditors + workspaceFiles
  const pickerFiles = filePickerQuery
    ? workspaceFiles.filter((f) => !attachedFiles.some((a) => a.filePath === f.filePath))
    : [...openEditors, ...workspaceFiles.filter((f) => !openEditors.some((o) => o.filePath === f.filePath))]
        .filter((f) => !attachedFiles.some((a) => a.filePath === f.filePath));

  // # トリガーのファイル候補
  const hashFiles = hashQuery
    ? workspaceFiles.filter((f) =>
        f.fileName.toLowerCase().includes(hashQuery.toLowerCase()) ||
        f.filePath.toLowerCase().includes(hashQuery.toLowerCase()),
      ).filter((f) => !attachedFiles.some((a) => a.filePath === f.filePath)).slice(0, 10)
    : [...openEditors, ...workspaceFiles.filter((f) => !openEditors.some((o) => o.filePath === f.filePath))]
        .filter((f) => !attachedFiles.some((a) => a.filePath === f.filePath)).slice(0, 10);

  // 現在アクティブなエディタファイル (リストの先頭)
  const activeEditorFile = openEditors.length > 0 ? openEditors[0] : null;
  const isActiveAttached = activeEditorFile ? attachedFiles.some((f) => f.filePath === activeEditorFile.filePath) : false;

  return (
    <div className="input-area">
      <div className="input-wrapper">
        {/* コンテキストバー: クリップボタン + 添付ファイルチップ + quick-add を1行に */}
        <div className="context-bar">
          <div className="context-bar-left">
            {/* クリップボタン */}
            <div className="context-clip-container" ref={filePickerRef}>
              <button className="context-clip-button" onClick={handleClipClick} title={t["input.addContext"]}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M10.97 2.29a1.625 1.625 0 0 0-2.298 0L3.836 7.126a2.813 2.813 0 0 0 3.977 3.977l4.837-4.836-.707-.708-4.837 4.837a1.813 1.813 0 0 1-2.563-2.563L9.38 2.997a.625.625 0 0 1 .884.884L5.427 8.718a.313.313 0 0 0 .442.442l4.837-4.837-.707-.707-4.837 4.837a1.313 1.313 0 0 1-1.856-1.856l4.836-4.837a1.625 1.625 0 0 1 2.298 0 1.625 1.625 0 0 1 0 2.298l-4.837 4.837a2.813 2.813 0 0 1-3.977-3.977L7.63 1.285l-.707-.707L1.285 6.214a3.813 3.813 0 0 0 5.391 5.391l4.837-4.837a2.625 2.625 0 0 0 0-3.712 2.625 2.625 0 0 0-.543-.356z" />
                </svg>
              </button>
              {showFilePicker && (
                <div className="file-picker-dropdown">
                  <input
                    className="file-picker-search"
                    placeholder={t["input.searchFiles"]}
                    value={filePickerQuery}
                    onChange={(e) => handleFilePickerSearch(e.target.value)}
                    autoFocus
                  />
                  <div className="file-picker-list">
                    {pickerFiles.length > 0 ? (
                      pickerFiles.slice(0, 15).map((file) => (
                        <div
                          key={file.filePath}
                          className="file-picker-item"
                          onClick={() => addFile(file)}
                        >
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
                  className="attached-file-remove"
                  onClick={() => removeFile(file.filePath)}
                  title={t["input.remove"]}
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.708.708L7.293 8l-3.647 3.646.708.708L8 8.707z" />
                  </svg>
                </button>
              </div>
            ))}
            {/* 現在開いているファイルの quick-add ボタン */}
            {activeEditorFile && !isActiveAttached && (
              <button
                className="context-file-button"
                onClick={() => addFile(activeEditorFile)}
                title={t["input.addFile"](activeEditorFile.filePath)}
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z" />
                </svg>
                <span>{activeEditorFile.fileName}</span>
              </button>
            )}
          </div>
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
        <div className="textarea-container">
          <textarea
            ref={textareaRef}
            className="input-textarea"
            placeholder={t["input.placeholder"]}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionEnd={() => { composingRef.current = false; }}
            rows={1}
          />
          {/* # トリガー ファイル候補ポップアップ */}
          {hashTrigger.active && (
            <div className="hash-popup" ref={hashPopupRef}>
              {hashFiles.length > 0 ? (
                hashFiles.map((file) => (
                  <div
                    key={file.filePath}
                    className="hash-popup-item"
                    onClick={() => addFile(file)}
                  >
                    <span className="hash-popup-item-name">{file.fileName}</span>
                    <span className="hash-popup-item-path">{file.filePath}</span>
                  </div>
                ))
              ) : (
                <div className="hash-popup-empty">{t["input.noFiles"]}</div>
              )}
            </div>
          )}
        </div>

        <div className="input-actions">
          <div className="input-actions-left">
            <ModelSelector
              providers={providers}
              allProvidersData={allProvidersData}
              selectedModel={selectedModel}
              onSelect={onModelSelect}
            />
            <button
              className="tool-config-button"
              onClick={onOpenTerminal}
              title={t["input.openTerminal"]}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 3.5l4.5 4.5L1 12.5l1 1 5.5-5.5L2 2.5l-1 1zM8 13h7v-1H8v1z" />
              </svg>
            </button>
            <button
              className="tool-config-button"
              onClick={() => setShowToolConfig((s) => !s)}
              title={t["input.settings"]}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M14.773 7.308l-1.394-.461a5.543 5.543 0 0 0-.476-1.147l.646-1.32a.249.249 0 0 0-.046-.283l-.87-.87a.249.249 0 0 0-.283-.046l-1.32.646a5.543 5.543 0 0 0-1.147-.476l-.461-1.394A.249.249 0 0 0 9.184 1.8H8.016a.249.249 0 0 0-.238.157l-.461 1.394a5.543 5.543 0 0 0-1.147.476l-1.32-.646a.249.249 0 0 0-.283.046l-.87.87a.249.249 0 0 0-.046.283l.646 1.32a5.543 5.543 0 0 0-.476 1.147l-1.394.461A.249.249 0 0 0 2.27 7.546v1.168c0 .103.064.196.157.238l1.394.461c.11.4.27.784.476 1.147l-.646 1.32a.249.249 0 0 0 .046.283l.87.87c.073.073.18.096.283.046l1.32-.646c.363.206.747.366 1.147.476l.461 1.394c.042.093.135.157.238.157h1.168c.103 0 .196-.064.238-.157l.461-1.394a5.543 5.543 0 0 0 1.147-.476l1.32.646a.249.249 0 0 0 .283-.046l.87-.87a.249.249 0 0 0 .046-.283l-.646-1.32c.206-.363.366-.747.476-1.147l1.394-.461a.249.249 0 0 0 .157-.238V7.546a.249.249 0 0 0-.157-.238zM8.6 10.9a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6z" />
              </svg>
              <span className={`chevron-icon ${showToolConfig ? "expanded" : ""}`}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5.3 5.3-5.3 5.4z" />
                </svg>
              </span>
            </button>
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
          <button className="send-button" onClick={onAbort} title={t["input.stop"]}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="3" y="3" width="10" height="10" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            className="send-button"
            onClick={handleSend}
            disabled={!text.trim()}
            title={t["input.send"]}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 1.5l14 6.5-14 6.5V9l8-1-8-1V1.5z" />
            </svg>
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
