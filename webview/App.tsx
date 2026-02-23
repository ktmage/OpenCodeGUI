import { useState, useEffect, useCallback } from "react";
import type { Session, Message, Part, Event, Permission } from "@opencode-ai/sdk";
import type { ExtToWebviewMessage } from "./vscode-api";
import { postMessage } from "./vscode-api";
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
      }
    };
    window.addEventListener("message", handler);
    postMessage({ type: "ready" });
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
    (text: string) => {
      if (!activeSession) return;
      postMessage({ type: "sendMessage", sessionId: activeSession.id, text });
    },
    [activeSession],
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

  const handleAbort = useCallback(() => {
    if (!activeSession) return;
    postMessage({ type: "abort", sessionId: activeSession.id });
  }, [activeSession]);

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
          <MessagesArea messages={messages} sessionBusy={sessionBusy} activeSessionId={activeSession.id} permissions={permissions} />
          <InputArea onSend={handleSend} onAbort={handleAbort} isBusy={sessionBusy} />
        </>
      ) : (
        <EmptyState onNewSession={handleNewSession} />
      )}
    </div>
  );
}
