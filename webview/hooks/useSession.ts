import type { Event, Session } from "@opencode-ai/sdk";
import { useCallback, useState } from "react";
import { postMessage } from "../vscode-api";

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);

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

  const toggleSessionList = useCallback(() => {
    setShowSessionList((s) => !s);
  }, []);

  // SSE event handler for session-related events
  const handleSessionEvent = useCallback((event: Event) => {
    switch (event.type) {
      case "session.status": {
        setSessionBusy(event.properties.status.type === "busy");
        break;
      }
      case "session.updated": {
        const info = event.properties.info;
        setSessions((prev) => prev.map((s) => (s.id === info.id ? info : s)));
        setActiveSession((prev) => (prev?.id === info.id ? info : prev));
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
  }, []);

  return {
    sessions,
    setSessions,
    activeSession,
    setActiveSession,
    sessionBusy,
    showSessionList,
    toggleSessionList,
    handleNewSession,
    handleSelectSession,
    handleDeleteSession,
    handleSessionEvent,
  } as const;
}
