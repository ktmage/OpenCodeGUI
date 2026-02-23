import { useState, useEffect, useCallback, useMemo } from "react";
import type { Session, Message, Part, Event, Permission, Provider } from "@opencode-ai/sdk";
import type { ExtToWebviewMessage, FileAttachment, AllProvidersData } from "./vscode-api";
import { postMessage, getPersistedState, setPersistedState } from "./vscode-api";
import { ChatHeader } from "./components/ChatHeader";
import { MessagesArea } from "./components/MessagesArea";
import { InputArea } from "./components/InputArea";
import { EmptyState } from "./components/EmptyState";
import { SessionList } from "./components/SessionList";
import { TodoHeader } from "./components/TodoHeader";
import { parseTodos } from "./components/ToolPartView";
import type { TodoItem } from "./components/ToolPartView";
import { LocaleProvider, resolveLocale, getStrings } from "./locales";
import type { LocaleSetting } from "./locales";

export type MessageWithParts = { info: Message; parts: Part[] };

export function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<MessageWithParts[]>([]);
  const [showSessionList, setShowSessionList] = useState(false);
  const [sessionBusy, setSessionBusy] = useState(false);
  // パーミッションリクエストを messageID でグルーピングして管理する
  const [permissions, setPermissions] = useState<Map<string, Permission>>(new Map());
  const [providers, setProviders] = useState<Provider[]>([]);
  const [allProvidersData, setAllProvidersData] = useState<AllProvidersData | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ providerID: string; modelID: string } | null>(null);
  const [openEditors, setOpenEditors] = useState<FileAttachment[]>([]);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileAttachment[]>([]);
  // チェックポイントからの復元時にテキストを入力欄にプリフィルするためのステート
  const [prefillText, setPrefillText] = useState("");
  // 設定パネル用のステート
  const [openCodePaths, setOpenCodePaths] = useState<{ home: string; config: string; state: string; directory: string } | null>(null);

  // ロケール管理
  const [localeSetting, setLocaleSetting] = useState<LocaleSetting>(
    () => (getPersistedState()?.localeSetting as LocaleSetting) ?? "auto",
  );
  const [vscodeLanguage, setVscodeLanguage] = useState("en");
  const resolvedLocale = useMemo(() => resolveLocale(localeSetting, vscodeLanguage), [localeSetting, vscodeLanguage]);
  const strings = useMemo(() => getStrings(resolvedLocale), [resolvedLocale]);

  const handleLocaleSettingChange = useCallback((setting: LocaleSetting) => {
    setLocaleSetting(setting);
    setPersistedState({ ...getPersistedState(), localeSetting: setting });
  }, []);

  // messages から StepFinishPart のトークン使用量を導出する（圧縮でメッセージが減ると自動的に反映される）
  const inputTokens = useMemo(() => {
    let total = 0;
    for (const m of messages) {
      for (const p of m.parts) {
        if (p.type === "step-finish" && p.tokens) {
          total += p.tokens.input;
        }
      }
    }
    return total;
  }, [messages]);

  // 選択中のモデルのコンテキストリミットを算出
  const contextLimit = useMemo(() => {
    if (!selectedModel) return 0;
    const provider = providers.find((p) => p.id === selectedModel.providerID);
    if (!provider) return 0;
    const model = provider.models[selectedModel.modelID];
    return model?.limit?.context ?? 0;
  }, [providers, selectedModel]);

  useEffect(() => {
    const handler = (e: MessageEvent<ExtToWebviewMessage>) => {
      const msg = e.data;
      switch (msg.type) {
        case "sessions":
          setSessions(msg.sessions);
          break;
        case "messages":
          if (msg.sessionId === activeSession?.id) {
            setMessages(msg.messages);
          }
          break;
        case "activeSession":
          setActiveSession(msg.session);
          if (msg.session) {
            postMessage({ type: "getMessages", sessionId: msg.session.id });
          } else {
            setMessages([]);
          }
          break;
        case "event":
          handleEvent(msg.event);
          break;
        case "providers": {
          setProviders(msg.providers);
          setAllProvidersData(msg.allProviders);
          // サーバーのモデル設定を反映する（config.model → default の順でフォールバック）
          setSelectedModel(() => {
            const modelStr = msg.configModel || msg.default["general"] || msg.default["code"] || Object.values(msg.default)[0];
            if (!modelStr) return null;
            const slashIndex = modelStr.indexOf("/");
            if (slashIndex < 0) return null;
            return {
              providerID: modelStr.slice(0, slashIndex),
              modelID: modelStr.slice(slashIndex + 1),
            };
          });
          break;
        }
        case "openEditors":
          setOpenEditors(msg.files);
          break;
        case "workspaceFiles":
          setWorkspaceFiles(msg.files);
          break;
        case "toolConfig":
          setOpenCodePaths(msg.paths);
          break;
        case "locale":
          setVscodeLanguage(msg.vscodeLanguage);
          break;
        case "modelUpdated": {
          const slashIndex = msg.model.indexOf("/");
          if (slashIndex >= 0) {
            setSelectedModel({
              providerID: msg.model.slice(0, slashIndex),
              modelID: msg.model.slice(slashIndex + 1),
            });
          }
          break;
        }
      }
    };
    window.addEventListener("message", handler);
    postMessage({ type: "ready" });
    postMessage({ type: "getOpenEditors" });
    return () => window.removeEventListener("message", handler);
  }, [activeSession?.id]);

  const handleEvent = useCallback(
    (event: Event) => {
      switch (event.type) {
        case "message.updated": {
          const info = event.properties.info;
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.info.id === info.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], info };
              return updated;
            }
            return [...prev, { info, parts: [] }];
          });
          break;
        }
        case "message.part.updated": {
          const part = event.properties.part;
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.info.id === part.messageID);
            if (idx < 0) return prev;
            const updated = [...prev];
            const msg = { ...updated[idx] };
            const partIdx = msg.parts.findIndex((p) => p.id === part.id);
            if (partIdx >= 0) {
              msg.parts = [...msg.parts];
              msg.parts[partIdx] = part;
            } else {
              msg.parts = [...msg.parts, part];
            }
            updated[idx] = msg;
            return updated;
          });
          break;
        }
        case "session.status": {
          setSessionBusy(event.properties.status.type === "busy");
          break;
        }
        case "permission.updated": {
          const permission = event.properties;
          setPermissions((prev) => {
            const next = new Map(prev);
            next.set(permission.id, permission);
            return next;
          });
          break;
        }
        case "permission.replied": {
          const permissionID = event.properties.permissionID;
          setPermissions((prev) => {
            const next = new Map(prev);
            next.delete(permissionID);
            return next;
          });
          break;
        }
        case "message.removed": {
          // 圧縮時にメッセージが削除される → messages から除去すると inputTokens も自動的に再計算される
          const { messageID } = event.properties;
          setMessages((prev) => prev.filter((m) => m.info.id !== messageID));
          break;
        }
        case "session.updated": {
          const info = event.properties.info;
          setSessions((prev) =>
            prev.map((s) => (s.id === info.id ? info : s)),
          );
          setActiveSession((prev) =>
            prev?.id === info.id ? info : prev,
          );
          break;
        }
        case "session.created": {
          setSessions((prev) => [event.properties.info, ...prev]);
          break;
        }
        case "session.deleted": {
          const deletedId = event.properties.info.id;
          setSessions((prev) => prev.filter((s) => s.id !== deletedId));
          break;
        }
      }
    },
    [],
  );

  const handleSend = useCallback(
    (text: string, files: FileAttachment[]) => {
      if (!activeSession) return;
      postMessage({
        type: "sendMessage",
        sessionId: activeSession.id,
        text,
        model: selectedModel ?? undefined,
        files: files.length > 0 ? files : undefined,
      });
    },
    [activeSession, selectedModel],
  );

  const handleNewSession = useCallback(() => {
    postMessage({ type: "createSession" });
    setShowSessionList(false);
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    postMessage({ type: "selectSession", sessionId });
    setShowSessionList(false);
  }, []);

  const handleDeleteSession = useCallback((sessionId: string) => {
    postMessage({ type: "deleteSession", sessionId });
  }, []);

  const handleModelSelect = useCallback((model: { providerID: string; modelID: string }) => {
    setSelectedModel(model);
    postMessage({ type: "setModel", model: `${model.providerID}/${model.modelID}` });
  }, []);

  const handleAbort = useCallback(() => {
    if (!activeSession) return;
    postMessage({ type: "abort", sessionId: activeSession.id });
  }, [activeSession]);

  const handleCompress = useCallback(() => {
    if (!activeSession) return;
    postMessage({
      type: "compressSession",
      sessionId: activeSession.id,
      model: selectedModel ?? undefined,
    });
  }, [activeSession, selectedModel]);

  const handleOpenConfigFile = useCallback((filePath: string) => {
    postMessage({ type: "openConfigFile", filePath });
  }, []);

  const handleOpenTerminal = useCallback(() => {
    postMessage({ type: "openTerminal" });
  }, []);

  // ユーザーメッセージを編集して再送信する
  const handleEditAndResend = useCallback(
    (messageId: string, text: string) => {
      if (!activeSession) return;
      // messageId は編集対象のユーザーメッセージ。
      // その直前のメッセージまで巻き戻し、編集後のテキストを送信する。
      const msgIndex = messages.findIndex((m) => m.info.id === messageId);
      if (msgIndex < 0) return;
      if (msgIndex === 0) {
        // 最初のメッセージの場合: 新規セッションを作成して送信する方がクリーン
        // ただし revert API のフォールバックとして、messageId 自体で revert
        postMessage({
          type: "editAndResend",
          sessionId: activeSession.id,
          messageId,
          text,
          model: selectedModel ?? undefined,
        });
      } else {
        // 直前のメッセージまで巻き戻して再送信
        const prevMessageId = messages[msgIndex - 1].info.id;
        postMessage({
          type: "editAndResend",
          sessionId: activeSession.id,
          messageId: prevMessageId,
          text,
          model: selectedModel ?? undefined,
        });
      }
    },
    [activeSession, messages, selectedModel],
  );

  // チェックポイントまで巻き戻す + ユーザーメッセージのテキストを入力欄に復元
  const handleRevertToCheckpoint = useCallback(
    (assistantMessageId: string, userText: string | null) => {
      if (!activeSession) return;
      postMessage({
        type: "revertToMessage",
        sessionId: activeSession.id,
        messageId: assistantMessageId,
      });
      // ユーザーメッセージのテキストを入力欄にプリフィルする
      setPrefillText(userText ?? "");
    },
    [activeSession],
  );

  // メッセージから最新の ToDo リストを導出（todowrite/todoread ツールの最新の出力）
  const latestTodos = useMemo<TodoItem[]>(() => {
    for (let mi = messages.length - 1; mi >= 0; mi--) {
      const parts = messages[mi].parts;
      for (let pi = parts.length - 1; pi >= 0; pi--) {
        const p = parts[pi];
        if (p.type !== "tool") continue;
        if (p.tool !== "todowrite" && p.tool !== "todoread") continue;
        const st = p.state;
        if (st.status === "completed" && st.output) {
          const parsed = parseTodos(st.output);
          if (parsed) return parsed;
        }
        if (st.status !== "pending") {
          const input = st.input as Record<string, unknown> | undefined;
          if (input) {
            const parsed = parseTodos(input.todos ?? input);
            if (parsed) return parsed;
          }
        }
      }
    }
    return [];
  }, [messages]);

  return (
    <LocaleProvider value={strings}>
    <div className="chat-container">
      <ChatHeader
        activeSession={activeSession}
        onNewSession={handleNewSession}
        onToggleSessionList={() => setShowSessionList((s) => !s)}
      />
      {showSessionList && (
        <SessionList
          sessions={sessions}
          activeSessionId={activeSession?.id ?? null}
          onSelect={handleSelectSession}
          onDelete={handleDeleteSession}
          onClose={() => setShowSessionList(false)}
        />
      )}
      {activeSession ? (
        <>
          <MessagesArea
            messages={messages}
            sessionBusy={sessionBusy}
            activeSessionId={activeSession.id}
            permissions={permissions}
            onEditAndResend={handleEditAndResend}
            onRevertToCheckpoint={handleRevertToCheckpoint}
          />
          {latestTodos.length > 0 && <TodoHeader todos={latestTodos} />}
          <InputArea
            onSend={handleSend}
            onAbort={handleAbort}
            isBusy={sessionBusy}
            providers={providers}
            allProvidersData={allProvidersData}
            selectedModel={selectedModel}
            onModelSelect={handleModelSelect}
            openEditors={openEditors}
            workspaceFiles={workspaceFiles}
            inputTokens={inputTokens}
            contextLimit={contextLimit}
            onCompress={handleCompress}
            isCompressing={!!activeSession?.time?.compacting}
            prefillText={prefillText}
            onPrefillConsumed={() => setPrefillText("")}
            openCodePaths={openCodePaths}
            onOpenConfigFile={handleOpenConfigFile}
            onOpenTerminal={handleOpenTerminal}
            localeSetting={localeSetting}
            onLocaleSettingChange={handleLocaleSettingChange}
          />
        </>
      ) : (
        <EmptyState onNewSession={handleNewSession} />
      )}
    </div>
    </LocaleProvider>
  );
}
