import type { en } from "./en";

export const ru: typeof en = {
  // ChatHeader
  "header.sessions": "Сессии",
  "header.title.fallback": "OpenCode",
  "header.newChat": "Новый чат",

  // EmptyState
  "empty.title": "OpenCode",
  "empty.description": "Начните новый разговор.",
  "empty.newChat": "Новый чат",

  // InputArea
  "input.addContext": "Добавить контекст",
  "input.searchFiles": "Поиск файлов...",
  "input.noFiles": "Файлы не найдены",
  "input.remove": "Удалить",
  "input.placeholder": "Спросите OpenCode... (введите # для прикрепления файлов)",
  "input.addFile": (name: string) => `Добавить ${name}`,
  "input.openTerminal": "Открыть сессию в терминале",
  "input.shellMode": "Режим Shell",
  "input.placeholder.shell": "Введите команду оболочки...",
  "input.settings": "Настройки",
  "input.stop": "Остановить",
  "input.send": "Отправить",

  // MessageItem
  "message.fileFallback": "файл",
  "message.clickToEdit": "Нажмите для редактирования",
  "message.cancel": "Отмена",
  "message.send": "Отправить",
  "message.thought": "Мысль",
  "message.thinking": "Думаю…",
  "message.toggleThought": "Переключить детали мысли",

  // MessagesArea
  "checkpoint.revertTitle": "Вернуться к этой точке",
  "checkpoint.retryFromHere": "Повторить отсюда",
  "checkpoint.forkFromHere": "Ответвить отсюда",

  // Undo/Redo
  "header.undo": "Отменить",
  "header.redo": "Повторить",

  // PermissionView
  "permission.allow": "Разрешить",
  "permission.once": "Однократно",
  "permission.deny": "Отклонить",

  // SessionList
  "session.noSessions": "Нет сессий",
  "session.untitled": "Без названия",
  "session.delete": "Удалить",
  "session.select": "Выбрать сессию",

  // Time (relative)
  "time.now": "сейчас",
  "time.minutes": (n: number) => `${n}мин`,
  "time.hours": (n: number) => `${n}ч`,
  "time.days": (n: number) => `${n}д`,

  // ToolPartView - category labels
  "tool.read": "Чтение",
  "tool.edit": "Редактирование",
  "tool.create": "Создание",
  "tool.run": "Запуск",
  "tool.search": "Поиск",
  "tool.tool": "Инструмент",
  "tool.toggleDetails": "Переключить детали",
  "tool.completed": (done: number, total: number) => `${done}/${total} завершено`,
  "tool.moreLines": (n: number) => `… ещё ${n} строк`,
  "tool.addLines": (n: number) => `+${n} строк`,
  "tool.todos": (done: number, total: number) => `${done}/${total} задач`,

  // ModelSelector
  "model.selectModel": "Выбрать модель",
  "model.notConnected": "Не подключено",
  "model.connectedOnly": "Только подключённые",
  "model.showAll": "Показать всех провайдеров",
  "model.hideDisconnected": "Скрыть отключённых провайдеров",

  // TodoHeader
  "todo.label": "Задачи",
  "todo.toggleList": "Переключить список задач",

  // ShellResultView
  "shell.title": "Shell",

  // ToolConfigPanel
  "config.title": "Настройки",
  "config.projectConfig": "Настройки проекта",
  "config.globalConfig": "Глобальные настройки",

  "config.close": "Закрыть",

  // Language setting
  "config.language": "Язык",
  "config.langAuto": "Автоматически (VS Code)",
  "config.langEn": "English",
  "config.langJa": "日本語",
  "config.langZhCn": "简体中文",
  "config.langKo": "한국어",
  "config.langZhTw": "繁體中文",
  "config.langEs": "Español",
  "config.langPtBr": "Português (Brasil)",
  "config.langRu": "Русский",

  // Sound notification
  "config.sound": "Звуковое уведомление",
  "config.soundResponseComplete": "Ответ завершён",
  "config.soundPermissionRequest": "Запрос разрешения",
  "config.soundError": "Ошибка",
  "config.soundVolume": "Громкость",

  // FileChangesHeader
  "fileChanges.title": "Изменения файлов",
  "fileChanges.noChanges": "Нет изменений файлов",
  "fileChanges.openDiff": "Открыть в редакторе различий",
  "fileChanges.toggle": "Изменения файлов",

  // Share
  "share.share": "Поделиться сессией",
  "share.unshare": "Отменить общий доступ",
  "share.copied": "Ссылка скопирована в буфер обмена",

  // ChildSession
  "childSession.agent": "Агент",
  "childSession.backToParent": "Вернуться к родительской сессии",

  // Context menu sections
  "input.section.files": "Файлы",
  "input.section.agents": "Агенты",
  "input.section.shell": "Режим Shell",

  // AgentMention
  "input.noAgents": "Нет доступных агентов",
};
