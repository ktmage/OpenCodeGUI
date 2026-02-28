import type { en } from "./en";

export const ja: typeof en = {
  // ChatHeader
  "header.sessions": "セッション一覧",
  "header.title.fallback": "OpenCode",
  "header.newChat": "新しいチャット",

  // EmptyState
  "empty.title": "OpenCode",
  "empty.description": "新しい会話を始めましょう。",
  "empty.newChat": "新しいチャット",

  // InputArea
  "input.addContext": "コンテキストを追加",
  "input.searchFiles": "ファイルを検索...",
  "input.noFiles": "ファイルが見つかりません",
  "input.remove": "削除",
  "input.placeholder": "OpenCode に質問... (# でファイルを添付)",
  "input.addFile": (name: string) => `${name} を追加`,
  "input.openTerminal": "ターミナルで開く",
  "input.shellMode": "シェルモード",
  "input.placeholder.shell": "シェルコマンドを入力...",
  "input.settings": "設定",
  "input.stop": "停止",
  "input.send": "送信",

  // MessageItem
  "message.fileFallback": "ファイル",
  "message.clickToEdit": "クリックして編集",
  "message.cancel": "キャンセル",
  "message.send": "送信",
  "message.thought": "思考",
  "message.thinking": "思考中…",
  "message.toggleThought": "思考の詳細を切り替え",

  // MessagesArea
  "checkpoint.revertTitle": "ここまで巻き戻す",
  "checkpoint.retryFromHere": "ここからやり直す",
  "checkpoint.forkFromHere": "ここから分岐",

  // PermissionView
  "permission.allow": "許可",
  "permission.once": "一度だけ",
  "permission.deny": "拒否",

  // SessionList
  "session.noSessions": "セッションなし",
  "session.untitled": "無題",
  "session.delete": "削除",
  "session.select": "セッションを選択",

  // Time (relative)
  "time.now": "今",
  "time.minutes": (n: number) => `${n}分`,
  "time.hours": (n: number) => `${n}時間`,
  "time.days": (n: number) => `${n}日`,

  // ToolPartView - category labels
  "tool.read": "読み取り",
  "tool.edit": "編集",
  "tool.create": "作成",
  "tool.run": "実行",
  "tool.search": "検索",
  "tool.tool": "ツール",
  "tool.toggleDetails": "詳細を切り替え",
  "tool.completed": (done: number, total: number) => `${done}/${total} 完了`,
  "tool.moreLines": (n: number) => `… 他 ${n} 行`,
  "tool.addLines": (n: number) => `+${n} 行`,
  "tool.todos": (done: number, total: number) => `${done}/${total} ToDo`,

  // ModelSelector
  "model.selectModel": "モデルを選択",
  "model.notConnected": "未接続",
  "model.connectedOnly": "接続済みのみ",
  "model.showAll": "すべてのプロバイダーを表示",
  "model.hideDisconnected": "未接続のプロバイダーを非表示",

  // TodoHeader
  "todo.label": "ToDo",
  "todo.toggleList": "ToDoリストを切り替え",

  // ContextIndicator
  "context.title": (percent: number) => `コンテキスト: ${percent}% 使用中`,
  "context.windowUsage": "コンテキストウィンドウ使用量",
  "context.inputTokens": "入力トークン",
  "context.contextLimit": "コンテキスト上限",
  "context.compressing": "圧縮中...",
  "context.compress": "会話を圧縮",

  // ShellResultView
  "shell.title": "シェル",

  // ToolConfigPanel
  "config.title": "設定",
  "config.projectConfig": "プロジェクト設定",
  "config.globalConfig": "グローバル設定",

  "config.close": "閉じる",

  // Language setting
  "config.language": "言語",
  "config.langAuto": "自動 (VS Code)",
  "config.langEn": "English",
  "config.langJa": "日本語",

  // FileChangesHeader
  "fileChanges.title": "ファイル変更",
  "fileChanges.noChanges": "ファイル変更なし",
  "fileChanges.openDiff": "差分エディタで開く",
  "fileChanges.toggle": "ファイル変更",

  // ChildSession
  "childSession.agent": "エージェント",
  "childSession.backToParent": "親セッションに戻る",
};
