import type { en } from "./en";

export const zhCn: typeof en = {
  // ChatHeader
  "header.sessions": "会话列表",
  "header.title.fallback": "OpenCode",
  "header.newChat": "新建聊天",

  // EmptyState
  "empty.title": "OpenCode",
  "empty.description": "开始新的对话吧。",
  "empty.newChat": "新建聊天",

  // InputArea
  "input.addContext": "添加上下文",
  "input.searchFiles": "搜索文件...",
  "input.noFiles": "未找到文件",
  "input.remove": "移除",
  "input.placeholder": "向 OpenCode 提问...（输入 # 附加文件）",
  "input.addFile": (name: string) => `添加 ${name}`,
  "input.openTerminal": "在终端中打开会话",
  "input.shellMode": "Shell 模式",
  "input.placeholder.shell": "输入 Shell 命令...",
  "input.settings": "设置",
  "input.stop": "停止",
  "input.send": "发送",

  // MessageItem
  "message.fileFallback": "文件",
  "message.clickToEdit": "点击编辑",
  "message.cancel": "取消",
  "message.send": "发送",
  "message.thought": "思考",
  "message.thinking": "思考中…",
  "message.toggleThought": "切换思考详情",

  // MessagesArea
  "checkpoint.revertTitle": "回退到此处",
  "checkpoint.retryFromHere": "从此处重试",
  "checkpoint.forkFromHere": "从此处分支",

  // Undo/Redo
  "header.undo": "撤销",
  "header.redo": "重做",

  // PermissionView
  "permission.allow": "允许",
  "permission.once": "仅一次",
  "permission.deny": "拒绝",

  // SessionList
  "session.noSessions": "暂无会话",
  "session.untitled": "无标题",
  "session.delete": "删除",
  "session.select": "选择会话",

  // Time (relative)
  "time.now": "刚刚",
  "time.minutes": (n: number) => `${n}分钟`,
  "time.hours": (n: number) => `${n}小时`,
  "time.days": (n: number) => `${n}天`,

  // ToolPartView - category labels
  "tool.read": "读取",
  "tool.edit": "编辑",
  "tool.create": "创建",
  "tool.run": "运行",
  "tool.search": "搜索",
  "tool.tool": "工具",
  "tool.toggleDetails": "切换详情",
  "tool.completed": (done: number, total: number) => `${done}/${total} 已完成`,
  "tool.moreLines": (n: number) => `… 还有 ${n} 行`,
  "tool.addLines": (n: number) => `+${n} 行`,
  "tool.todos": (done: number, total: number) => `${done}/${total} 待办`,

  // ModelSelector
  "model.selectModel": "选择模型",
  "model.notConnected": "未连接",
  "model.connectedOnly": "仅已连接",
  "model.showAll": "显示所有提供者",
  "model.hideDisconnected": "隐藏未连接的提供者",

  // TodoHeader
  "todo.label": "待办",
  "todo.toggleList": "切换待办列表",

  // ContextIndicator
  "context.title": (percent: number) => `上下文：已使用 ${percent}%`,
  "context.windowUsage": "上下文窗口使用量",
  "context.inputTokens": "输入 Token",
  "context.contextLimit": "上下文上限",
  "context.compressing": "压缩中...",
  "context.compress": "压缩对话",

  // ShellResultView
  "shell.title": "Shell",

  // ToolConfigPanel
  "config.title": "设置",
  "config.projectConfig": "项目配置",
  "config.globalConfig": "全局配置",

  "config.close": "关闭",

  // Language setting
  "config.language": "语言",
  "config.langAuto": "自动（VS Code）",
  "config.langEn": "English",
  "config.langJa": "日本語",
  "config.langZhCn": "简体中文",
  "config.langKo": "한국어",
  "config.langZhTw": "繁體中文",
  "config.langEs": "Español",
  "config.langPtBr": "Português (Brasil)",
  "config.langRu": "Русский",

  // FileChangesHeader
  "fileChanges.title": "文件更改",
  "fileChanges.noChanges": "无文件更改",
  "fileChanges.openDiff": "在差异编辑器中打开",
  "fileChanges.toggle": "文件更改",

  // Share
  "share.share": "共享会话",
  "share.unshare": "取消共享",
  "share.copied": "共享链接已复制到剪贴板",

  // ChildSession
  "childSession.agent": "智能体",
  "childSession.backToParent": "返回父会话",

  // Context menu sections
  "input.section.files": "文件",
  "input.section.agents": "智能体",
  "input.section.shell": "Shell 模式",

  // AgentMention
  "input.noAgents": "没有可用的智能体",
};
