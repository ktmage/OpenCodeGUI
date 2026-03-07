import type { en } from "./en";

export const ko: typeof en = {
  // ChatHeader
  "header.sessions": "세션 목록",
  "header.title.fallback": "OpenCode",
  "header.newChat": "새 채팅",

  // EmptyState
  "empty.title": "OpenCode",
  "empty.description": "새 대화를 시작하세요.",
  "empty.newChat": "새 채팅",

  // InputArea
  "input.addContext": "컨텍스트 추가",
  "input.searchFiles": "파일 검색...",
  "input.noFiles": "파일을 찾을 수 없습니다",
  "input.remove": "제거",
  "input.placeholder": "OpenCode에 질문하기... (# 으로 파일 첨부)",
  "input.addFile": (name: string) => `${name} 추가`,
  "input.openTerminal": "터미널에서 세션 열기",
  "input.shellMode": "셸 모드",
  "input.placeholder.shell": "셸 명령어 입력...",
  "input.settings": "설정",
  "input.stop": "중지",
  "input.send": "전송",

  // MessageItem
  "message.fileFallback": "파일",
  "message.clickToEdit": "클릭하여 편집",
  "message.cancel": "취소",
  "message.send": "전송",
  "message.thought": "사고",
  "message.thinking": "사고 중…",
  "message.toggleThought": "사고 상세 전환",

  // MessagesArea
  "checkpoint.revertTitle": "이 지점으로 되돌리기",
  "checkpoint.retryFromHere": "여기서 다시 시도",
  "checkpoint.forkFromHere": "여기서 분기",

  // Undo/Redo
  "header.undo": "실행 취소",
  "header.redo": "다시 실행",

  // PermissionView
  "permission.allow": "허용",
  "permission.once": "한 번만",
  "permission.deny": "거부",

  // SessionList
  "session.noSessions": "세션 없음",
  "session.untitled": "제목 없음",
  "session.delete": "삭제",
  "session.select": "세션 선택",

  // Time (relative)
  "time.now": "방금",
  "time.minutes": (n: number) => `${n}분`,
  "time.hours": (n: number) => `${n}시간`,
  "time.days": (n: number) => `${n}일`,

  // ToolPartView - category labels
  "tool.read": "읽기",
  "tool.edit": "편집",
  "tool.create": "생성",
  "tool.run": "실행",
  "tool.search": "검색",
  "tool.tool": "도구",
  "tool.toggleDetails": "상세 전환",
  "tool.completed": (done: number, total: number) => `${done}/${total} 완료`,
  "tool.moreLines": (n: number) => `… +${n}줄 더`,
  "tool.addLines": (n: number) => `+${n}줄`,
  "tool.todos": (done: number, total: number) => `${done}/${total} 할 일`,

  // ModelSelector
  "model.selectModel": "모델 선택",
  "model.notConnected": "연결 안 됨",
  "model.connectedOnly": "연결됨만",
  "model.showAll": "모든 제공자 표시",
  "model.hideDisconnected": "연결 안 된 제공자 숨기기",

  // TodoHeader
  "todo.label": "할 일",
  "todo.toggleList": "할 일 목록 전환",

  // ContextIndicator
  "context.title": (percent: number) => `컨텍스트: ${percent}% 사용 중`,
  "context.windowUsage": "컨텍스트 윈도우 사용량",
  "context.inputTokens": "입력 토큰",
  "context.contextLimit": "컨텍스트 한도",
  "context.compressing": "압축 중...",
  "context.compress": "대화 압축",

  // ShellResultView
  "shell.title": "셸",

  // ToolConfigPanel
  "config.title": "설정",
  "config.projectConfig": "프로젝트 설정",
  "config.globalConfig": "전역 설정",

  "config.close": "닫기",

  // Language setting
  "config.language": "언어",
  "config.langAuto": "자동 (VS Code)",
  "config.langEn": "English",
  "config.langJa": "日本語",
  "config.langZhCn": "简体中文",
  "config.langKo": "한국어",
  "config.langZhTw": "繁體中文",
  "config.langEs": "Español",
  "config.langPtBr": "Português (Brasil)",
  "config.langRu": "Русский",

  // FileChangesHeader
  "fileChanges.title": "파일 변경",
  "fileChanges.noChanges": "파일 변경 없음",
  "fileChanges.openDiff": "차이 편집기에서 열기",
  "fileChanges.toggle": "파일 변경",

  // Share
  "share.share": "세션 공유",
  "share.unshare": "공유 해제",
  "share.copied": "공유 URL이 클립보드에 복사되었습니다",

  // ChildSession
  "childSession.agent": "에이전트",
  "childSession.backToParent": "상위 세션으로 돌아가기",

  // Context menu sections
  "input.section.files": "파일",
  "input.section.agents": "에이전트",
  "input.section.shell": "셸 모드",

  // AgentMention
  "input.noAgents": "사용 가능한 에이전트가 없습니다",
};
