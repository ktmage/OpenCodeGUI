import type { LocaleSchema } from "./en";

export const zhTw: LocaleSchema = {
  // ChatHeader
  "header.sessions": "工作階段列表",
  "header.title.fallback": "OpenCode",
  "header.newChat": "新建聊天",

  // EmptyState
  "empty.title": "OpenCode",
  "empty.description": "開始新的對話吧。",
  "empty.newChat": "新建聊天",

  // InputArea
  "input.addContext": "新增上下文",
  "input.searchFiles": "搜尋檔案...",
  "input.noFiles": "找不到檔案",
  "input.remove": "移除",
  "input.placeholder": "向 OpenCode 提問...（輸入 # 附加檔案）",
  "input.addFile": (name: string) => `新增 ${name}`,
  "input.openTerminal": "在終端機中開啟工作階段",
  "input.shellMode": "Shell 模式",
  "input.placeholder.shell": "輸入 Shell 命令...",
  "input.settings": "設定",
  "input.stop": "停止",
  "input.send": "傳送",

  // MessageItem
  "message.fileFallback": "檔案",
  "message.clickToEdit": "點擊編輯",
  "message.cancel": "取消",
  "message.send": "傳送",
  "message.thought": "思考",
  "message.thinking": "思考中…",
  "message.toggleThought": "切換思考詳情",

  // MessagesArea
  "checkpoint.revertTitle": "回退到此處",
  "checkpoint.retryFromHere": "從此處重試",
  "checkpoint.forkFromHere": "從此處分支",
  "scrollToBottom.ariaLabel": "捲動到底部",

  // Undo/Redo
  "header.undo": "復原",
  "header.redo": "重做",

  // PermissionView
  "permission.title": "權限",
  "permission.allow": "允許",
  "permission.once": "僅一次",
  "permission.deny": "拒絕",

  // QuestionView
  "question.submit": "提交",
  "question.reject": "拒絕",
  "question.customPlaceholder": "輸入自訂回答...",

  // SessionList
  "session.noSessions": "沒有工作階段",
  "session.untitled": "無標題",
  "session.delete": "刪除",
  "session.select": "選擇工作階段",

  // Time (relative)
  "time.now": "剛剛",
  "time.minutes": (n: number) => `${n}分鐘`,
  "time.hours": (n: number) => `${n}小時`,
  "time.days": (n: number) => `${n}天`,

  // ToolPartView - category labels
  "tool.read": "讀取",
  "tool.edit": "編輯",
  "tool.create": "建立",
  "tool.run": "執行",
  "tool.search": "搜尋",
  "tool.tool": "工具",
  "tool.toggleDetails": "切換詳情",
  "tool.completed": (done: number, total: number) => `${done}/${total} 已完成`,
  "tool.moreLines": (n: number) => `… 還有 ${n} 行`,
  "tool.addLines": (n: number) => `+${n} 行`,
  "tool.todos": (done: number, total: number) => `${done}/${total} 待辦`,

  // ModelSelector
  "model.selectModel": "選擇模型",
  "model.notConnected": "未連線",
  "model.connectedOnly": "僅已連線",
  "model.showAll": "顯示所有提供者",
  "model.hideDisconnected": "隱藏未連線的提供者",

  // AgentSelector
  "agent.selectAgent": "選擇代理",
  "agent.agents": "代理",

  // TodoHeader
  "todo.label": "待辦",
  "todo.toggleList": "切換待辦列表",

  // ShellResultView
  "shell.title": "Shell",

  // ToolConfigPanel
  "config.title": "設定",
  "config.projectConfig": "專案設定",
  "config.globalConfig": "全域設定",

  "config.close": "關閉",

  // Language setting
  "config.language": "語言",
  "config.langAuto": "自動（VS Code）",
  "config.langEn": "English",
  "config.langJa": "日本語",
  "config.langZhCn": "简体中文",
  "config.langKo": "한국어",
  "config.langZhTw": "繁體中文",
  "config.langEs": "Español",
  "config.langPtBr": "Português (Brasil)",
  "config.langRu": "Русский",

  // Sound notification
  "config.sound": "聲音通知",
  "config.soundResponseComplete": "回應完成",
  "config.soundPermissionRequest": "權限請求",
  "config.soundQuestionAsked": "提問",
  "config.soundError": "錯誤",
  "config.soundVolume": "音量",

  // FileChangesHeader
  "fileChanges.title": "檔案變更",
  "fileChanges.noChanges": "沒有檔案變更",
  "fileChanges.openDiff": "在差異編輯器中開啟",
  "fileChanges.diffReview": "Diff Review",
  "fileChanges.openReview": "在 Diff Review 中開啟",
  "fileChanges.toggle": "檔案變更",

  // Share
  "share.share": "分享工作階段",
  "share.unshare": "取消分享",
  "share.copied": "分享連結已複製到剪貼簿",

  // ChildSession
  "childSession.agent": "智慧代理",
  "childSession.backToParent": "返回上層工作階段",

  // Context menu sections
  "input.section.files": "檔案",
  "input.section.agents": "子代理",
  "input.section.shell": "Shell 模式",

  // AgentMention
  "input.noAgents": "沒有可用的子代理",
};
