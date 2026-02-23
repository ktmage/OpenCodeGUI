import { useState, useEffect, useCallback, useMemo } from "react";
import type { Session, Message, Part, Event, Permission, Provider } from "@opencode-ai/sdk";
import type { ExtToWebviewMessage, FileAttachment } from "./vscode-api";
import { postMessage, getPersistedState, setPersistedState } from "./vscode-api";
import { ChatHeader } from "./components/ChatHeader";
import { MessagesArea } from "./components/MessagesArea";
import { InputArea } from "./components/InputArea";
import { EmptyState } from "./components/EmptyState";
import { SessionList } from "./components/SessionList";

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
  const [selectedModel, setSelectedModel] = useState<{ providerID: string; modelID: string } | null>(
    () => getPersistedState()?.selectedModel ?? null,
  );
  const [openEditors, setOpenEditors] = useState<FileAttachment[]>([]);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileAttachment[]>([]);
  // チェックポイントからの復元時にテキストを入力欄にプリフィルするためのステート
  const [prefillText, setPrefillText] = useState("");

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
          // 永続化された選択がなければデフォルトモデルを設定する
          setSelectedModel((prev) => {
            if (prev) return prev;
            const defaultModel = msg.default["general"] || msg.default["code"] || Object.values(msg.default)[0];
            if (!defaultModel) return null;
            // default は "providerID/modelID" 形式
            const slashIndex = defaultModel.indexOf("/");
            if (slashIndex < 0) return null;
            const model = {
              providerID: defaultModel.slice(0, slashIndex),
              modelID: defaultModel.slice(slashIndex + 1),
            };
            setPersistedState({ selectedModel: model });
            return model;
          });
          break;
        }
        case "openEditors":
          setOpenEditors(msg.files);
          break;
        case "workspaceFiles":
          setWorkspaceFiles(msg.files);
          break;
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
    setPersistedState({ selectedModel: model });
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

  return (
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
          <InputArea
            onSend={handleSend}
            onAbort={handleAbort}
            isBusy={sessionBusy}
            providers={providers}
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
          />
        </>
      ) : (
        <EmptyState onNewSession={handleNewSession} />
      )}
    </div>
  );
}
