export const en = {
  // ChatHeader
  "header.sessions": "Sessions",
  "header.title.fallback": "OpenCode",
  "header.newChat": "New chat",

  // EmptyState
  "empty.title": "OpenCode",
  "empty.description": "Start a new conversation to get started.",
  "empty.newChat": "New Chat",

  // InputArea
  "input.addContext": "Add context",
  "input.searchFiles": "Search files...",
  "input.noFiles": "No files found",
  "input.remove": "Remove",
  "input.placeholder": "Ask OpenCode... (type # to attach files)",
  "input.addFile": (name: string) => `Add ${name}`,
  "input.openTerminal": "Open session in terminal",
  "input.shellMode": "Shell mode",
  "input.placeholder.shell": "Enter shell command...",
  "input.settings": "Settings",
  "input.stop": "Stop",
  "input.send": "Send",

  // MessageItem
  "message.fileFallback": "file",
  "message.clickToEdit": "Click to edit",
  "message.cancel": "Cancel",
  "message.send": "Send",
  "message.thought": "Thought",
  "message.thinking": "Thinking…",
  "message.toggleThought": "Toggle thought details",

  // MessagesArea
  "checkpoint.revertTitle": "Revert to this point",
  "checkpoint.retryFromHere": "Retry from here",
  "checkpoint.forkFromHere": "Fork from here",

  // Undo/Redo
  "header.undo": "Undo",
  "header.redo": "Redo",

  // PermissionView
  "permission.allow": "Allow",
  "permission.once": "Once",
  "permission.deny": "Deny",

  // QuestionView
  "question.submit": "Submit",
  "question.reject": "Reject",
  "question.customPlaceholder": "Type a custom answer...",

  // SessionList
  "session.noSessions": "No sessions",
  "session.untitled": "Untitled",
  "session.delete": "Delete",
  "session.select": "Select session",

  // Time (relative)
  "time.now": "now",
  "time.minutes": (n: number) => `${n}m`,
  "time.hours": (n: number) => `${n}h`,
  "time.days": (n: number) => `${n}d`,

  // ToolPartView - category labels
  "tool.read": "Read",
  "tool.edit": "Edit",
  "tool.create": "Create",
  "tool.run": "Run",
  "tool.search": "Search",
  "tool.tool": "Tool",
  "tool.toggleDetails": "Toggle details",
  "tool.completed": (done: number, total: number) => `${done}/${total} completed`,
  "tool.moreLines": (n: number) => `… +${n} more lines`,
  "tool.addLines": (n: number) => `+${n} lines`,
  "tool.todos": (done: number, total: number) => `${done}/${total} todos`,

  // ModelSelector
  "model.selectModel": "Select model",
  "model.notConnected": "Not connected",
  "model.connectedOnly": "Connected only",
  "model.showAll": "Show all providers",
  "model.hideDisconnected": "Hide disconnected providers",

  // AgentSelector
  "agent.selectAgent": "Select agent",
  "agent.agents": "Agents",

  // TodoHeader
  "todo.label": "To Do",
  "todo.toggleList": "Toggle to-do list",

  // ShellResultView
  "shell.title": "Shell",

  // ToolConfigPanel
  "config.title": "Settings",
  "config.projectConfig": "Project Config",
  "config.globalConfig": "Global Config",

  "config.close": "Close",

  // Language setting
  "config.language": "Language",
  "config.langAuto": "Auto (VS Code)",
  "config.langEn": "English",
  "config.langJa": "日本語",
  "config.langZhCn": "简体中文",
  "config.langKo": "한국어",
  "config.langZhTw": "繁體中文",
  "config.langEs": "Español",
  "config.langPtBr": "Português (Brasil)",
  "config.langRu": "Русский",

  // Sound notification
  "config.sound": "Sound Notification",
  "config.soundResponseComplete": "Response complete",
  "config.soundPermissionRequest": "Permission request",
  "config.soundQuestionAsked": "Question asked",
  "config.soundError": "Error",
  "config.soundVolume": "Volume",

  // FileChangesHeader
  "fileChanges.title": "File Changes",
  "fileChanges.noChanges": "No file changes",
  "fileChanges.openDiff": "Open in diff editor",
  "fileChanges.diffReview": "Diff Review",
  "fileChanges.openReview": "Open in Diff Review",
  "fileChanges.toggle": "File changes",

  // Share
  "share.share": "Share session",
  "share.unshare": "Unshare session",
  "share.copied": "Share URL copied to clipboard",

  // ChildSession
  "childSession.agent": "Agent",
  "childSession.backToParent": "Back to parent session",

  // Context menu sections
  "input.section.files": "Files",
  "input.section.agents": "Sub-agents",
  "input.section.shell": "Shell Mode",

  // AgentMention
  "input.noAgents": "No sub-agents available",
} as const;

export type LocaleKeys = keyof typeof en;
