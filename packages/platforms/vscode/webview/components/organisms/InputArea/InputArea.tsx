import type { AgentInfo, ProviderInfo, SoundEventSetting, SoundEventType, SoundSettings } from "@opencodegui/core";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { useInputHistory } from "../../../hooks/useInputHistory";
import type { LocaleSetting } from "../../../locales";
import { useLocale } from "../../../locales";
import type { AllProvidersData, FileAttachment } from "../../../vscode-api";
import { postMessage } from "../../../vscode-api";
import { IconButton } from "../../atoms/IconButton";
import { AgentIcon, ChevronRightIcon, CloseIcon, GearIcon, SendIcon, StopIcon, TerminalIcon } from "../../atoms/icons";
import { Popover } from "../../atoms/Popover";
import { AgentPopup } from "../../molecules/AgentPopup";
import { AgentSelector } from "../../molecules/AgentSelector";
import { FileAttachmentBar } from "../../molecules/FileAttachmentBar";
import { HashFilePopup } from "../../molecules/HashFilePopup";
import { ModelSelector } from "../../molecules/ModelSelector";
import { ToolConfigPanel } from "../../organisms/ToolConfigPanel";
import styles from "./InputArea.module.css";

type Props = {
  onSend: (text: string, files: FileAttachment[], agent?: string, primaryAgent?: string) => void;
  onShellExecute: (command: string) => void;
  onAbort: () => void;
  isBusy: boolean;
  providers: ProviderInfo[];
  allProvidersData: AllProvidersData | null;
  selectedModel: { providerID: string; modelID: string } | null;
  onModelSelect: (model: { providerID: string; modelID: string }) => void;
  selectedPrimaryAgent: string | null;
  onPrimaryAgentSelect: (agentName: string) => void;
  openEditors: FileAttachment[];
  activeEditorFile: FileAttachment | null;
  workspaceFiles: FileAttachment[];
  prefillText?: string;
  onPrefillConsumed?: () => void;
  openCodePaths: { home?: string; config: string; state: string; directory: string } | null;
  onOpenConfigFile: (filePath: string) => void;
  onOpenTerminal: () => void;
  localeSetting: LocaleSetting;
  onLocaleSettingChange: (setting: LocaleSetting) => void;
  soundSettings: SoundSettings;
  onSoundSettingChange: (eventType: SoundEventType, setting: Partial<SoundEventSetting>) => void;
  agents: AgentInfo[];
};

export function InputArea({
  onSend,
  onShellExecute,
  onAbort,
  isBusy,
  providers,
  allProvidersData,
  selectedModel,
  onModelSelect,
  selectedPrimaryAgent,
  onPrimaryAgentSelect,
  openEditors,
  activeEditorFile,
  workspaceFiles,
  prefillText,
  onPrefillConsumed,
  openCodePaths,
  onOpenConfigFile,
  onOpenTerminal,
  localeSetting,
  onLocaleSettingChange,
  soundSettings,
  onSoundSettingChange,
  agents,
}: Props) {
  const t = useLocale();
  const [text, setText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filePickerQuery, setFilePickerQuery] = useState("");
  // # トリガー用
  const [hashTrigger, setHashTrigger] = useState<{ active: boolean; startIndex: number }>({
    active: false,
    startIndex: -1,
  });
  const [hashQuery, setHashQuery] = useState("");
  // @ トリガー用
  const [atTrigger, setAtTrigger] = useState<{ active: boolean; startIndex: number }>({
    active: false,
    startIndex: -1,
  });
  const [atQuery, setAtQuery] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [isShellMode, setIsShellMode] = useState(false);
  // ポップアップ内のフォーカス位置（-1 = フォーカスなし）
  const [hashFocusedIndex, setHashFocusedIndex] = useState(-1);
  const [atFocusedIndex, setAtFocusedIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const composingRef = useRef(false);
  const filePickerRef = useRef<HTMLDivElement>(null);
  const hashPopupRef = useRef<HTMLDivElement>(null);
  const agentPopupRef = useRef<HTMLDivElement>(null);
  const inputHistory = useInputHistory();
  // 履歴テキスト適用時は onChange が走るが resetNavigation を呼ばないようにするフラグ
  const applyingHistoryRef = useRef(false);

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
      // ファイル添付はシェルモードと排他
      setIsShellMode(false);
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

  // 外部クリックで @ ポップアップを閉じる
  useClickOutside(
    [agentPopupRef, textareaRef],
    () => {
      setAtTrigger({ active: false, startIndex: -1 });
      setAtQuery("");
    },
    atTrigger.active,
  );

  // # トリガー: ワークスペースファイルを検索する
  useEffect(() => {
    if (hashTrigger.active) {
      postMessage({ type: "searchWorkspaceFiles", query: hashQuery });
    }
  }, [hashTrigger.active, hashQuery]);

  // シェルモード ON: session.shell() はファイル・エージェントパラメータを受け付けないため排他にする
  const enableShellMode = useCallback(() => {
    setIsShellMode(true);
    setAttachedFiles([]);
    setSelectedAgent(null);
  }, []);

  // シェルモード OFF
  const disableShellMode = useCallback(() => {
    setIsShellMode(false);
  }, []);

  // シェルモードトグル（統合メニュー用）
  const toggleShellMode = useCallback(() => {
    if (isShellMode) {
      disableShellMode();
    } else {
      enableShellMode();
    }
  }, [isShellMode, enableShellMode, disableShellMode]);

  // @ トリガー: エージェント選択時のハンドラ
  const selectAgent = useCallback(
    (agent: AgentInfo) => {
      setSelectedAgent(agent);
      // エージェント選択はシェルモードと排他
      setIsShellMode(false);
      // テキストから @query を削除する
      if (atTrigger.active) {
        setText((prev) => {
          const before = prev.slice(0, atTrigger.startIndex);
          const after = prev.slice(atTrigger.startIndex + 1 + atQuery.length);
          return before + after;
        });
      }
      setAtTrigger({ active: false, startIndex: -1 });
      setAtQuery("");
      textareaRef.current?.focus();
    },
    [atTrigger, atQuery],
  );

  // 選択済みエージェントを解除する
  const clearAgent = useCallback(() => {
    setSelectedAgent(null);
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // 送信テキストを履歴に追加する
    inputHistory.addEntry(trimmed);
    if (isShellMode) {
      onShellExecute(trimmed);
    } else {
      onSend(trimmed, attachedFiles, selectedAgent?.name, selectedPrimaryAgent ?? undefined);
    }
    setText("");
    setAttachedFiles([]);
    setSelectedAgent(null);
    setIsShellMode(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [
    text,
    attachedFiles,
    onSend,
    onShellExecute,
    selectedAgent?.name,
    isShellMode,
    inputHistory,
    selectedPrimaryAgent,
  ]);

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

  // @ トリガーのエージェント候補（サブエージェントのみ表示）
  const subagents = agents.filter((a) => a.mode === "subagent" || a.mode === "all");
  const filteredAgents = atQuery
    ? subagents.filter((a) => a.name.toLowerCase().includes(atQuery.toLowerCase())).slice(0, 10)
    : subagents.slice(0, 10);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // Escape で # ポップアップを閉じる
      if (e.key === "Escape" && hashTrigger.active) {
        setHashTrigger({ active: false, startIndex: -1 });
        setHashQuery("");
        setHashFocusedIndex(-1);
        return;
      }
      // Escape で @ ポップアップを閉じる
      if (e.key === "Escape" && atTrigger.active) {
        setAtTrigger({ active: false, startIndex: -1 });
        setAtQuery("");
        setAtFocusedIndex(-1);
        return;
      }

      // # ポップアップ表示中の Tab / ↑ / ↓ / Enter ナビゲーション
      if (hashTrigger.active && hashFiles.length > 0) {
        // Tab / ↓ はフォーカスを次の項目に移動する
        if (e.key === "Tab" || e.key === "ArrowDown") {
          e.preventDefault();
          setHashFocusedIndex((prev) => (prev + 1) % hashFiles.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setHashFocusedIndex((prev) => (prev <= 0 ? hashFiles.length - 1 : prev - 1));
          return;
        }
        // Enter でフォーカス中の項目を確定する
        if (e.key === "Enter" && !e.shiftKey && !composingRef.current && hashFocusedIndex >= 0) {
          e.preventDefault();
          addFile(hashFiles[hashFocusedIndex]);
          setHashFocusedIndex(-1);
          return;
        }
      }

      // @ ポップアップ表示中の Tab / ↑ / ↓ / Enter ナビゲーション
      if (atTrigger.active && filteredAgents.length > 0) {
        // Tab / ↓ はフォーカスを次の項目に移動する
        if (e.key === "Tab" || e.key === "ArrowDown") {
          e.preventDefault();
          setAtFocusedIndex((prev) => (prev + 1) % filteredAgents.length);
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setAtFocusedIndex((prev) => (prev <= 0 ? filteredAgents.length - 1 : prev - 1));
          return;
        }
        // Enter でフォーカス中の項目を確定する
        if (e.key === "Enter" && !e.shiftKey && !composingRef.current && atFocusedIndex >= 0) {
          e.preventDefault();
          selectAgent(filteredAgents[atFocusedIndex]);
          setAtFocusedIndex(-1);
          return;
        }
      }

      // ArrowUp: カーソルが先頭行にあるとき履歴を遡る
      if (e.key === "ArrowUp" && !composingRef.current) {
        const el = textareaRef.current;
        if (el) {
          const cursorPos = el.selectionStart;
          const firstNewline = text.indexOf("\n");
          const isFirstLine = firstNewline === -1 || cursorPos <= firstNewline;
          if (isFirstLine) {
            const entry = inputHistory.navigateUp(text);
            if (entry !== null) {
              e.preventDefault();
              applyingHistoryRef.current = true;
              setText(entry);
              // テキスト変更後に高さを調整してカーソルを先頭に置く
              requestAnimationFrame(() => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                  el.setSelectionRange(0, 0);
                }
                applyingHistoryRef.current = false;
              });
              return;
            }
          }
        }
      }

      // ArrowDown: カーソルが末尾行にあるとき履歴を進める
      if (e.key === "ArrowDown" && !composingRef.current) {
        const el = textareaRef.current;
        if (el) {
          const cursorPos = el.selectionStart;
          const lastNewline = text.lastIndexOf("\n");
          const isLastLine = lastNewline === -1 || cursorPos > lastNewline;
          if (isLastLine) {
            const entry = inputHistory.navigateDown(text);
            if (entry !== null) {
              e.preventDefault();
              applyingHistoryRef.current = true;
              setText(entry);
              requestAnimationFrame(() => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                  const len = entry.length;
                  el.setSelectionRange(len, len);
                }
                applyingHistoryRef.current = false;
              });
              return;
            }
          }
        }
      }

      // IME 変換中は送信しない
      if (e.key === "Enter" && !e.shiftKey && !composingRef.current) {
        e.preventDefault();
        if (isBusy) return;
        // # ポップアップ表示中はファイル選択ではなく送信を優先
        if (hashTrigger.active) {
          setHashTrigger({ active: false, startIndex: -1 });
          setHashQuery("");
          setHashFocusedIndex(-1);
        }
        if (atTrigger.active) {
          setAtTrigger({ active: false, startIndex: -1 });
          setAtQuery("");
          setAtFocusedIndex(-1);
        }
        handleSend();
      }
    },
    [
      handleSend,
      isBusy,
      hashTrigger.active,
      atTrigger.active,
      hashFocusedIndex,
      atFocusedIndex,
      hashFiles,
      filteredAgents,
      addFile,
      selectAgent,
      text,
      inputHistory,
    ],
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setText(newText);

      // 履歴適用による setText 以外のテキスト変更ではナビゲーションをリセットする
      if (!applyingHistoryRef.current) {
        inputHistory.resetNavigation();
      }

      // ! プレフィクス検出: 先頭に ! が入力されたらシェルモードを ON にし ! をテキストから除去する
      if (newText.startsWith("!") && !isShellMode) {
        enableShellMode();
        const withoutBang = newText.slice(1);
        setText(withoutBang);
        return;
      }

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
        if (
          addedChar === "@" &&
          (cursorPos === 1 || newText[cursorPos - 2] === " " || newText[cursorPos - 2] === "\n")
        ) {
          // @ の前が空白・改行・先頭の場合にトリガーを開始
          setAtTrigger({ active: true, startIndex: cursorPos - 1 });
          setAtQuery("");
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
          setHashFocusedIndex(-1);
        } else {
          setHashQuery(queryPart);
          // クエリ変更時にフォーカスをリセットする
          setHashFocusedIndex(-1);
        }
      }

      // @ トリガーがアクティブなら、クエリを更新する
      if (atTrigger.active) {
        const queryPart = newText.slice(atTrigger.startIndex + 1, cursorPos);
        if (/[\s]/.test(queryPart) || cursorPos <= atTrigger.startIndex) {
          setAtTrigger({ active: false, startIndex: -1 });
          setAtQuery("");
          setAtFocusedIndex(-1);
        } else {
          setAtQuery(queryPart);
          // クエリ変更時にフォーカスをリセットする
          setAtFocusedIndex(-1);
        }
      }
    },
    [text, hashTrigger, atTrigger, isShellMode, enableShellMode, inputHistory],
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

  const isActiveAttached = activeEditorFile
    ? attachedFiles.some((f) => f.filePath === activeEditorFile.filePath)
    : false;

  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        {/* コンテキストバー: エージェントチップ + クリップボタン + 添付ファイルチップ + quick-add を1行に */}
        <div className={styles.contextBar}>
          <div className={styles.contextBarLeft}>
            {/* シェルモードチップ */}
            {isShellMode && (
              <div className={styles.shellChip} data-testid="shell-chip">
                <TerminalIcon />
                <span className={styles.shellChipName}>{t["input.shellMode"]}</span>
                <button type="button" className={styles.shellChipClear} onClick={disableShellMode}>
                  <CloseIcon width={12} height={12} />
                </button>
              </div>
            )}
            {/* 選択済みエージェントチップ（ファイルチップの先頭に表示） */}
            {selectedAgent && (
              <div className={styles.agentChip}>
                <AgentIcon />
                <span className={styles.agentChipName}>@{selectedAgent.name}</span>
                <button type="button" className={styles.agentChipClear} onClick={clearAgent}>
                  <CloseIcon width={12} height={12} />
                </button>
              </div>
            )}
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
              agents={subagents}
              selectedAgent={selectedAgent}
              onSelectAgent={selectAgent}
              isShellMode={isShellMode}
              onToggleShellMode={toggleShellMode}
            />
          </div>
        </div>

        {/* テキスト入力エリア（# ポップアップ付き） */}
        <div className={styles.textareaContainer}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder={isShellMode ? t["input.placeholder.shell"] : t["input.placeholder"]}
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
            <HashFilePopup
              hashFiles={hashFiles}
              onAddFile={addFile}
              hashPopupRef={hashPopupRef}
              focusedIndex={hashFocusedIndex}
            />
          )}
          {/* @ トリガー エージェント候補ポップアップ */}
          {atTrigger.active && (
            <AgentPopup
              agents={filteredAgents}
              onSelectAgent={selectAgent}
              agentPopupRef={agentPopupRef}
              focusedIndex={atFocusedIndex}
            />
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
            <AgentSelector agents={agents} selectedAgent={selectedPrimaryAgent} onSelect={onPrimaryAgentSelect} />
            <Popover
              trigger={({ open, toggle }) => (
                <IconButton variant="muted" onClick={toggle} title={t["input.settings"]}>
                  <GearIcon />
                  <span className={`${styles.chevron} ${open ? styles.expanded : ""}`}>
                    <ChevronRightIcon />
                  </span>
                </IconButton>
              )}
              panel={({ close }) => (
                <ToolConfigPanel
                  paths={openCodePaths}
                  onOpenConfigFile={onOpenConfigFile}
                  onClose={close}
                  localeSetting={localeSetting}
                  onLocaleSettingChange={onLocaleSettingChange}
                  soundSettings={soundSettings}
                  onSoundSettingChange={onSoundSettingChange}
                />
              )}
            />
            <IconButton variant="muted" onClick={onOpenTerminal} title={t["input.openTerminal"]}>
              <TerminalIcon />
            </IconButton>
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
