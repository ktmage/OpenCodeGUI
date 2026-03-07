import type { en } from "./en";

export const es: typeof en = {
  // ChatHeader
  "header.sessions": "Sesiones",
  "header.title.fallback": "OpenCode",
  "header.newChat": "Nuevo chat",

  // EmptyState
  "empty.title": "OpenCode",
  "empty.description": "Inicia una nueva conversación para comenzar.",
  "empty.newChat": "Nuevo chat",

  // InputArea
  "input.addContext": "Añadir contexto",
  "input.searchFiles": "Buscar archivos...",
  "input.noFiles": "No se encontraron archivos",
  "input.remove": "Eliminar",
  "input.placeholder": "Pregunta a OpenCode... (escribe # para adjuntar archivos)",
  "input.addFile": (name: string) => `Añadir ${name}`,
  "input.openTerminal": "Abrir sesión en terminal",
  "input.shellMode": "Modo Shell",
  "input.placeholder.shell": "Ingresa un comando de shell...",
  "input.settings": "Configuración",
  "input.stop": "Detener",
  "input.send": "Enviar",

  // MessageItem
  "message.fileFallback": "archivo",
  "message.clickToEdit": "Haz clic para editar",
  "message.cancel": "Cancelar",
  "message.send": "Enviar",
  "message.thought": "Pensamiento",
  "message.thinking": "Pensando…",
  "message.toggleThought": "Alternar detalles de pensamiento",

  // MessagesArea
  "checkpoint.revertTitle": "Revertir a este punto",
  "checkpoint.retryFromHere": "Reintentar desde aquí",
  "checkpoint.forkFromHere": "Bifurcar desde aquí",

  // Undo/Redo
  "header.undo": "Deshacer",
  "header.redo": "Rehacer",

  // PermissionView
  "permission.allow": "Permitir",
  "permission.once": "Solo una vez",
  "permission.deny": "Denegar",

  // QuestionView
  "question.submit": "Enviar",
  "question.reject": "Rechazar",
  "question.customPlaceholder": "Escribir una respuesta personalizada...",

  // SessionList
  "session.noSessions": "Sin sesiones",
  "session.untitled": "Sin título",
  "session.delete": "Eliminar",
  "session.select": "Seleccionar sesión",

  // Time (relative)
  "time.now": "ahora",
  "time.minutes": (n: number) => `${n}min`,
  "time.hours": (n: number) => `${n}h`,
  "time.days": (n: number) => `${n}d`,

  // ToolPartView - category labels
  "tool.read": "Leer",
  "tool.edit": "Editar",
  "tool.create": "Crear",
  "tool.run": "Ejecutar",
  "tool.search": "Buscar",
  "tool.tool": "Herramienta",
  "tool.toggleDetails": "Alternar detalles",
  "tool.completed": (done: number, total: number) => `${done}/${total} completados`,
  "tool.moreLines": (n: number) => `… +${n} líneas más`,
  "tool.addLines": (n: number) => `+${n} líneas`,
  "tool.todos": (done: number, total: number) => `${done}/${total} tareas`,

  // ModelSelector
  "model.selectModel": "Seleccionar modelo",
  "model.notConnected": "No conectado",
  "model.connectedOnly": "Solo conectados",
  "model.showAll": "Mostrar todos los proveedores",
  "model.hideDisconnected": "Ocultar proveedores desconectados",

  // AgentSelector
  "agent.selectAgent": "Seleccionar agente",
  "agent.agents": "Agentes",

  // TodoHeader
  "todo.label": "Tareas",
  "todo.toggleList": "Alternar lista de tareas",

  // ShellResultView
  "shell.title": "Shell",

  // ToolConfigPanel
  "config.title": "Configuración",
  "config.projectConfig": "Configuración del proyecto",
  "config.globalConfig": "Configuración global",

  "config.close": "Cerrar",

  // Language setting
  "config.language": "Idioma",
  "config.langAuto": "Automático (VS Code)",
  "config.langEn": "English",
  "config.langJa": "日本語",
  "config.langZhCn": "简体中文",
  "config.langKo": "한국어",
  "config.langZhTw": "繁體中文",
  "config.langEs": "Español",
  "config.langPtBr": "Português (Brasil)",
  "config.langRu": "Русский",

  // Sound notification
  "config.sound": "Notificación de sonido",
  "config.soundResponseComplete": "Respuesta completada",
  "config.soundPermissionRequest": "Solicitud de permiso",
  "config.soundError": "Error",
  "config.soundVolume": "Volumen",

  // FileChangesHeader
  "fileChanges.title": "Cambios de archivos",
  "fileChanges.noChanges": "Sin cambios de archivos",
  "fileChanges.openDiff": "Abrir en editor de diferencias",
  "fileChanges.diffReview": "Diff Review",
  "fileChanges.openReview": "Abrir en Diff Review",
  "fileChanges.toggle": "Cambios de archivos",

  // Share
  "share.share": "Compartir sesión",
  "share.unshare": "Dejar de compartir",
  "share.copied": "URL de compartir copiada al portapapeles",

  // ChildSession
  "childSession.agent": "Agente",
  "childSession.backToParent": "Volver a la sesión principal",

  // Context menu sections
  "input.section.files": "Archivos",
  "input.section.agents": "Sub-agentes",
  "input.section.shell": "Modo Shell",

  // AgentMention
  "input.noAgents": "No hay sub-agentes disponibles",
};
