import type { Event } from "@opencode-ai/sdk";
import { useCallback, useEffect, useState } from "react";
import { ChatHeader } from "./components/ChatHeader";
import { EmptyState } from "./components/EmptyState";
import { InputArea } from "./components/InputArea";
import { MessagesArea } from "./components/MessagesArea";
import { SessionList } from "./components/SessionList";
import { TodoHeader } from "./components/TodoHeader";
import { AppContextProvider, type AppContextValue } from "./contexts/AppContext";
import { useLocale } from "./hooks/useLocale";
import { useMessages } from "./hooks/useMessages";
import { usePermissions } from "./hooks/usePermissions";
import { useProviders } from "./hooks/useProviders";
import { useSession } from "./hooks/useSession";
import { LocaleProvider } from "./locales";
import type { ExtToWebviewMessage, FileAttachment } from "./vscode-api";
import { postMessage } from "./vscode-api";

// re-export for consumers that import from App.tsx
export type { MessageWithParts } from "./hooks/useMessages";

export function App() {
  const session = useSession();
  const msg = useMessages();
  const prov = useProviders();
  const perm = usePermissions();
  const locale = useLocale();

  // Extension Host → Webview メッセージでのみ更新される単純なステート
  const [openEditors, setOpenEditors] = useState<FileAttachment[]>([]);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileAttachment[]>([]);
  const [openCodePaths, setOpenCodePaths] = useState<{
    home: string;
    config: string;
    state: string;
    directory: string;
  } | null>(null);

  const handleOpenConfigFile = useCallback((filePath: string) => {
    postMessage({ type: "openConfigFile", filePath });
  }, []);

  const handleOpenTerminal = useCallback(() => {
    postMessage({ type: "openTerminal" });
  }, []);

  // SSE event handler — dispatches to domain-specific hooks
  const handleEvent = useCallback(
    (event: Event) => {
      session.handleSessionEvent(event);
      msg.handleMessageEvent(event);
      perm.handlePermissionEvent(event);
    },
    [session.handleSessionEvent, msg.handleMessageEvent, perm.handlePermissionEvent],
  );

  // Extension Host → Webview message listener
  useEffect(() => {
    const handler = (e: MessageEvent<ExtToWebviewMessage>) => {
      const data = e.data;
      switch (data.type) {
        case "sessions":
          session.setSessions(data.sessions);
          break;
        case "messages":
          if (data.sessionId === session.activeSession?.id) {
            msg.setMessages(data.messages);
          }
          break;
        case "activeSession":
          session.setActiveSession(data.session);
          if (data.session) {
            postMessage({ type: "getMessages", sessionId: data.session.id });
          } else {
            msg.setMessages([]);
          }
          break;
        case "event":
          handleEvent(data.event);
          break;
        case "providers": {
          prov.setProviders(data.providers);
          prov.setAllProvidersData(data.allProviders);
          // サーバーのモデル設定を反映する（config.model → default の順でフォールバック）
          prov.setSelectedModel(() => {
            const modelStr =
              data.configModel || data.default.general || data.default.code || Object.values(data.default)[0];
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
          setOpenEditors(data.files);
          break;
        case "workspaceFiles":
          setWorkspaceFiles(data.files);
          break;
        case "toolConfig":
          setOpenCodePaths(data.paths);
          break;
        case "locale":
          locale.setVscodeLanguage(data.vscodeLanguage);
          break;
        case "modelUpdated": {
          const slashIndex = data.model.indexOf("/");
          if (slashIndex >= 0) {
            prov.setSelectedModel({
              providerID: data.model.slice(0, slashIndex),
              modelID: data.model.slice(slashIndex + 1),
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
  }, [session.activeSession?.id, handleEvent, session, msg, prov, perm, locale]);

  // Cross-cutting action handlers (span multiple hooks)

  const handleSend = useCallback(
    (text: string, files: FileAttachment[]) => {
      if (!session.activeSession) return;
      postMessage({
        type: "sendMessage",
        sessionId: session.activeSession.id,
        text,
model: prov.selectedModel ?? undefined,
      files: files.length > 0 ? files : undefined,
    });
  },
    [session.activeSession, prov.selectedModel],
  );

  const handleAbort = useCallback(() => {
    if (!session.activeSession) return;
    postMessage({ type: "abort", sessionId: session.activeSession.id });
  }, [session.activeSession]);

  const handleCompress = useCallback(() => {
    if (!session.activeSession) return;
    postMessage({
      type: "compressSession",
      sessionId: session.activeSession.id,
      model: prov.selectedModel ?? undefined,
    });
  }, [session.activeSession, prov.selectedModel]);

  // ユーザーメッセージを編集して再送信する
  const handleEditAndResend = useCallback(
    (messageId: string, text: string) => {
      if (!session.activeSession) return;
      // messageId は編集対象のユーザーメッセージ。
      // その直前のメッセージまで巻き戻し、編集後のテキストを送信する。
      const msgIndex = msg.messages.findIndex((m) => m.info.id === messageId);
      if (msgIndex < 0) return;
      if (msgIndex === 0) {
        // 最初のメッセージの場合: 新規セッションを作成して送信する方がクリーン
        // ただし revert API のフォールバックとして、messageId 自体で revert
        postMessage({
          type: "editAndResend",
          sessionId: session.activeSession.id,
          messageId,
          text,
          model: prov.selectedModel ?? undefined,
        });
      } else {
        // 直前のメッセージまで巻き戻して再送信
        const prevMessageId = msg.messages[msgIndex - 1].info.id;
        postMessage({
          type: "editAndResend",
          sessionId: session.activeSession.id,
          messageId: prevMessageId,
          text,
          model: prov.selectedModel ?? undefined,
        });
      }
    },
    [session.activeSession, msg.messages, prov.selectedModel],
  );

  // チェックポイントまで巻き戻す + ユーザーメッセージのテキストを入力欄に復元
  const handleRevertToCheckpoint = useCallback(
    (assistantMessageId: string, userText: string | null) => {
      if (!session.activeSession) return;
      postMessage({
        type: "revertToMessage",
        sessionId: session.activeSession.id,
        messageId: assistantMessageId,
      });
      // ユーザーメッセージのテキストを入力欄にプリフィルする
      msg.setPrefillText(userText ?? "");
    },
    [session.activeSession, msg],
  );

  const contextValue: AppContextValue = {
    sessions: session.sessions,
    activeSession: session.activeSession,
    sessionBusy: session.sessionBusy,
    showSessionList: session.showSessionList,
    onNewSession: session.handleNewSession,
    onSelectSession: session.handleSelectSession,
    onDeleteSession: session.handleDeleteSession,
    onToggleSessionList: session.toggleSessionList,
    messages: msg.messages,
    inputTokens: msg.inputTokens,
    latestTodos: msg.latestTodos,
    prefillText: msg.prefillText,
    onPrefillConsumed: msg.consumePrefill,
    providers: prov.providers,
    allProvidersData: prov.allProvidersData,
    selectedModel: prov.selectedModel,
    onModelSelect: prov.handleModelSelect,
    contextLimit: prov.contextLimit,
    permissions: perm.permissions,
    openEditors,
    workspaceFiles,
    onSend: handleSend,
    onAbort: handleAbort,
    onCompress: handleCompress,
    isCompressing: !!session.activeSession?.time?.compacting,
    onEditAndResend: handleEditAndResend,
    onRevertToCheckpoint: handleRevertToCheckpoint,
    openCodePaths,
    onOpenConfigFile: handleOpenConfigFile,
    onOpenTerminal: handleOpenTerminal,
    localeSetting: locale.localeSetting,
    onLocaleSettingChange: locale.handleLocaleSettingChange,
  };

  return (
    <LocaleProvider value={locale.strings}>
      <AppContextProvider value={contextValue}>
        <div className="chat-container">
          <ChatHeader
            activeSession={session.activeSession}
            onNewSession={session.handleNewSession}
            onToggleSessionList={session.toggleSessionList}
          />
          {session.showSessionList && (
            <SessionList
              sessions={session.sessions}
              activeSessionId={session.activeSession?.id ?? null}
              onSelect={session.handleSelectSession}
              onDelete={session.handleDeleteSession}
              onClose={session.toggleSessionList}
            />
          )}
          {session.activeSession ? (
            <>
              <MessagesArea
                messages={msg.messages}
                sessionBusy={session.sessionBusy}
                activeSessionId={session.activeSession.id}
                permissions={perm.permissions}
                onEditAndResend={handleEditAndResend}
                onRevertToCheckpoint={handleRevertToCheckpoint}
              />
              {msg.latestTodos.length > 0 && <TodoHeader todos={msg.latestTodos} />}
              <InputArea
                onSend={handleSend}
                onAbort={handleAbort}
                isBusy={session.sessionBusy}
                providers={prov.providers}
                allProvidersData={prov.allProvidersData}
                selectedModel={prov.selectedModel}
                onModelSelect={prov.handleModelSelect}
                openEditors={openEditors}
                workspaceFiles={workspaceFiles}
                inputTokens={msg.inputTokens}
                contextLimit={prov.contextLimit}
                onCompress={handleCompress}
                isCompressing={!!session.activeSession?.time?.compacting}
                prefillText={msg.prefillText}
                onPrefillConsumed={msg.consumePrefill}
                openCodePaths={openCodePaths}
                onOpenConfigFile={handleOpenConfigFile}
                onOpenTerminal={handleOpenTerminal}
                localeSetting={locale.localeSetting}
                onLocaleSettingChange={locale.handleLocaleSettingChange}
              />
            </>
          ) : (
            <EmptyState onNewSession={session.handleNewSession} />
          )}
        </div>
      </AppContextProvider>
    </LocaleProvider>
  );
}
