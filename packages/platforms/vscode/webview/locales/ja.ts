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
  "input.openTerminal": "セッションをターミナルで開く",
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

  // Undo/Redo
  "header.undo": "元に戻す",
  "header.redo": "やり直し",

  // PermissionView
  "permission.title": "パーミッション",
  "permission.allow": "許可",
  "permission.once": "一度だけ",
  "permission.deny": "拒否",

  // QuestionView
  "question.submit": "送信",
  "question.reject": "拒否",
  "question.customPlaceholder": "カスタム回答を入力...",

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

  // AgentSelector
  "agent.selectAgent": "エージェントを選択",
  "agent.agents": "エージェント",

  // TodoHeader
  "todo.label": "ToDo",
  "todo.toggleList": "ToDoリストを切り替え",

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
  "config.langZhCn": "简体中文",
  "config.langKo": "한국어",
  "config.langZhTw": "繁體中文",
  "config.langEs": "Español",
  "config.langPtBr": "Português (Brasil)",
  "config.langRu": "Русский",

  // Sound notification
  "config.sound": "サウンド通知",
  "config.soundResponseComplete": "応答完了",
  "config.soundPermissionRequest": "パーミッション要求",
  "config.soundQuestionAsked": "質問",
  "config.soundError": "エラー",
  "config.soundVolume": "音量",

  // FileChangesHeader
  "fileChanges.title": "ファイル変更",
  "fileChanges.noChanges": "ファイル変更なし",
  "fileChanges.openDiff": "差分エディタで開く",
  "fileChanges.diffReview": "Diff Review",
  "fileChanges.openReview": "Diff Review で開く",
  "fileChanges.toggle": "ファイル変更",

  // Share
  "share.share": "セッションを共有",
  "share.unshare": "共有を解除",
  "share.copied": "共有 URL をクリップボードにコピーしました",

  // ChildSession
  "childSession.agent": "エージェント",
  "childSession.backToParent": "親セッションに戻る",

  // Context menu sections
  "input.section.files": "ファイル",
  "input.section.agents": "サブエージェント",
  "input.section.shell": "シェルモード",

  // AgentMention
  "input.noAgents": "利用可能なサブエージェントがありません",
};
