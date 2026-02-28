import type { Agent, Event, Session, Todo } from "@opencode-ai/sdk";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "./components/molecules/EmptyState";
import { FileChangesHeader } from "./components/molecules/FileChangesHeader";
import { TodoHeader } from "./components/molecules/TodoHeader";
import { ChatHeader } from "./components/organisms/ChatHeader";
import { InputArea } from "./components/organisms/InputArea";
import { MessagesArea } from "./components/organisms/MessagesArea";
import { SessionList } from "./components/organisms/SessionList";
import { AppContextProvider, type AppContextValue } from "./contexts/AppContext";
import { useFileChanges } from "./hooks/useFileChanges";
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
  const fileChanges = useFileChanges();

  // Extension Host → Webview メッセージでのみ更新される単純なステート
  const [openEditors, setOpenEditors] = useState<FileAttachment[]>([]);
  const [workspaceFiles, setWorkspaceFiles] = useState<FileAttachment[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [childSessions, setChildSessions] = useState<Session[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
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
      fileChanges.handleFileChangeEvent(event);

      // file.edited イベント時にセッション差分を再取得する
      if (event.type === "file.edited" && session.activeSession) {
        postMessage({ type: "getSessionDiff", sessionId: session.activeSession.id });
      }

      // todo.updated イベント時にアクティブセッションの Todo を更新する
      if (event.type === "todo.updated" && event.properties.sessionID === session.activeSession?.id) {
        setTodos(event.properties.todos as Todo[]);
      }

      // session.created イベント時にアクティブセッションの子セッションを再取得する
      // （サブエージェントが起動すると子セッションが作成されるため）
      if (event.type === "session.created" && session.activeSession) {
        postMessage({ type: "getChildSessions", sessionId: session.activeSession.id });
      }
    },
    [
      session.handleSessionEvent,
      session.activeSession,
      msg.handleMessageEvent,
      perm.handlePermissionEvent,
      fileChanges.handleFileChangeEvent,
    ],
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
            postMessage({ type: "getSessionDiff", sessionId: data.session.id });
            postMessage({ type: "getSessionTodos", sessionId: data.session.id });
            postMessage({ type: "getChildSessions", sessionId: data.session.id });
          } else {
            msg.setMessages([]);
            fileChanges.clearDiffs();
            setTodos([]);
            setChildSessions([]);
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
        case "sessionDiff": {
          if (data.sessionId === session.activeSession?.id) {
            fileChanges.setDiffs(data.diffs);
          }
          break;
        }
        case "sessionTodos": {
          if (data.sessionId === session.activeSession?.id) {
            setTodos(data.todos);
          }
          break;
        }
        case "childSessions": {
          if (data.sessionId === session.activeSession?.id) {
            setChildSessions(data.children);
          }
          break;
        }
        case "agents": {
          setAgents(data.agents);
          break;
        }
      }
    };
    window.addEventListener("message", handler);
    postMessage({ type: "ready" });
    postMessage({ type: "getOpenEditors" });
    postMessage({ type: "getAgents" });
    return () => window.removeEventListener("message", handler);
  }, [
    session.activeSession?.id,
    handleEvent,
    locale.setVscodeLanguage,
    msg.setMessages,
    fileChanges.setDiffs,
    fileChanges.clearDiffs,
    prov.setAllProvidersData,
    prov.setProviders,
    prov.setSelectedModel,
    session.setActiveSession,
    session.setSessions,
  ]);

  // Cross-cutting action handlers (span multiple hooks)

  const handleSend = useCallback(
    (text: string, files: FileAttachment[], agent?: string) => {
      if (!session.activeSession) return;
      postMessage({
        type: "sendMessage",
        sessionId: session.activeSession.id,
        text,
        model: prov.selectedModel ?? undefined,
        files: files.length > 0 ? files : undefined,
        agent,
      });
    },
    [session.activeSession, prov.selectedModel],
  );

  // ! プレフィクスで入力されたシェルコマンドを session.shell API 経由で実行する
  const handleShellExecute = useCallback(
    (command: string) => {
      if (!session.activeSession) return;
      // 次に到着する assistant メッセージをシェル結果としてタグ付けする準備
      msg.markPendingShell();
      postMessage({
        type: "executeShell",
        sessionId: session.activeSession.id,
        command,
        model: prov.selectedModel ?? undefined,
      });
    },
    [session.activeSession, prov.selectedModel, msg.markPendingShell],
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

  const handleOpenDiffEditor = useCallback((filePath: string, before: string, after: string) => {
    postMessage({ type: "openDiffEditor", filePath, before, after });
  }, []);

  // チェックポイントからセッションを Fork する
  const handleForkFromCheckpoint = useCallback(
    (messageId: string) => {
      if (!session.activeSession) return;
      postMessage({
        type: "forkSession",
        sessionId: session.activeSession.id,
        messageId,
      });
    },
    [session.activeSession],
  );

  // 子セッションにナビゲートする
  const handleNavigateToChild = useCallback(
    (sessionId: string) => {
      session.handleSelectSession(sessionId);
    },
    [session.handleSelectSession],
  );

  // 親セッションに戻る
  const handleNavigateToParent = useCallback(() => {
    if (!session.activeSession?.parentID) return;
    session.handleSelectSession(session.activeSession.parentID);
  }, [session.activeSession, session.handleSelectSession]);

  // 子セッション閲覧中かの判定
  const isChildSession = !!session.activeSession?.parentID;

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
    latestTodos: todos,
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
    fileDiffs: fileChanges.diffs,
    onOpenDiffEditor: handleOpenDiffEditor,
    onSend: handleSend,
    onShellExecute: handleShellExecute,
    isShellMessage: msg.isShellMessage,
    onAbort: handleAbort,
    onCompress: handleCompress,
    isCompressing: !!session.activeSession?.time?.compacting,
    onEditAndResend: handleEditAndResend,
    onRevertToCheckpoint: handleRevertToCheckpoint,
    onForkFromCheckpoint: handleForkFromCheckpoint,
    openCodePaths,
    onOpenConfigFile: handleOpenConfigFile,
    onOpenTerminal: handleOpenTerminal,
    localeSetting: locale.localeSetting,
    onLocaleSettingChange: locale.handleLocaleSettingChange,
    childSessions,
    onNavigateToChild: handleNavigateToChild,
    onNavigateToParent: handleNavigateToParent,
  };

  return (
    <LocaleProvider value={locale.strings}>
      <AppContextProvider value={contextValue}>
        <div className="chat-container">
          <ChatHeader
            activeSession={session.activeSession}
            onNewSession={session.handleNewSession}
            onToggleSessionList={session.toggleSessionList}
            onNavigateToParent={isChildSession ? handleNavigateToParent : undefined}
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
                onForkFromCheckpoint={handleForkFromCheckpoint}
              />
              {todos.length > 0 && <TodoHeader todos={todos} />}
              {fileChanges.diffs.length > 0 && (
                <FileChangesHeader diffs={fileChanges.diffs} onOpenDiffEditor={handleOpenDiffEditor} />
              )}
              {!isChildSession && (
                <InputArea
                  onSend={handleSend}
                  onShellExecute={handleShellExecute}
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
                  agents={agents}
                />
              )}
            </>
          ) : (
            <EmptyState onNewSession={session.handleNewSession} />
          )}
        </div>
      </AppContextProvider>
    </LocaleProvider>
  );
}
