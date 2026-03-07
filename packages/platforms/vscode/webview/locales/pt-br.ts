import type { en } from "./en";

export const ptBr: typeof en = {
  // ChatHeader
  "header.sessions": "Sessões",
  "header.title.fallback": "OpenCode",
  "header.newChat": "Novo chat",

  // EmptyState
  "empty.title": "OpenCode",
  "empty.description": "Inicie uma nova conversa para começar.",
  "empty.newChat": "Novo chat",

  // InputArea
  "input.addContext": "Adicionar contexto",
  "input.searchFiles": "Pesquisar arquivos...",
  "input.noFiles": "Nenhum arquivo encontrado",
  "input.remove": "Remover",
  "input.placeholder": "Pergunte ao OpenCode... (digite # para anexar arquivos)",
  "input.addFile": (name: string) => `Adicionar ${name}`,
  "input.openTerminal": "Abrir sessão no terminal",
  "input.shellMode": "Modo Shell",
  "input.placeholder.shell": "Digite um comando shell...",
  "input.settings": "Configurações",
  "input.stop": "Parar",
  "input.send": "Enviar",

  // MessageItem
  "message.fileFallback": "arquivo",
  "message.clickToEdit": "Clique para editar",
  "message.cancel": "Cancelar",
  "message.send": "Enviar",
  "message.thought": "Pensamento",
  "message.thinking": "Pensando…",
  "message.toggleThought": "Alternar detalhes do pensamento",

  // MessagesArea
  "checkpoint.revertTitle": "Reverter para este ponto",
  "checkpoint.retryFromHere": "Tentar novamente daqui",
  "checkpoint.forkFromHere": "Ramificar daqui",

  // Undo/Redo
  "header.undo": "Desfazer",
  "header.redo": "Refazer",

  // PermissionView
  "permission.allow": "Permitir",
  "permission.once": "Apenas uma vez",
  "permission.deny": "Negar",

  // SessionList
  "session.noSessions": "Sem sessões",
  "session.untitled": "Sem título",
  "session.delete": "Excluir",
  "session.select": "Selecionar sessão",

  // Time (relative)
  "time.now": "agora",
  "time.minutes": (n: number) => `${n}min`,
  "time.hours": (n: number) => `${n}h`,
  "time.days": (n: number) => `${n}d`,

  // ToolPartView - category labels
  "tool.read": "Ler",
  "tool.edit": "Editar",
  "tool.create": "Criar",
  "tool.run": "Executar",
  "tool.search": "Pesquisar",
  "tool.tool": "Ferramenta",
  "tool.toggleDetails": "Alternar detalhes",
  "tool.completed": (done: number, total: number) => `${done}/${total} concluídos`,
  "tool.moreLines": (n: number) => `… +${n} linhas`,
  "tool.addLines": (n: number) => `+${n} linhas`,
  "tool.todos": (done: number, total: number) => `${done}/${total} tarefas`,

  // ModelSelector
  "model.selectModel": "Selecionar modelo",
  "model.notConnected": "Não conectado",
  "model.connectedOnly": "Apenas conectados",
  "model.showAll": "Mostrar todos os provedores",
  "model.hideDisconnected": "Ocultar provedores desconectados",

  // TodoHeader
  "todo.label": "Tarefas",
  "todo.toggleList": "Alternar lista de tarefas",

  // ShellResultView
  "shell.title": "Shell",

  // ToolConfigPanel
  "config.title": "Configurações",
  "config.projectConfig": "Configuração do projeto",
  "config.globalConfig": "Configuração global",

  "config.close": "Fechar",

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
  "config.sound": "Notificação sonora",
  "config.soundResponseComplete": "Resposta concluída",
  "config.soundPermissionRequest": "Solicitação de permissão",
  "config.soundError": "Erro",
  "config.soundVolume": "Volume",

  // FileChangesHeader
  "fileChanges.title": "Alterações de arquivos",
  "fileChanges.noChanges": "Sem alterações de arquivos",
  "fileChanges.openDiff": "Abrir no editor de diferenças",
  "fileChanges.toggle": "Alterações de arquivos",

  // Share
  "share.share": "Compartilhar sessão",
  "share.unshare": "Deixar de compartilhar",
  "share.copied": "URL de compartilhamento copiada para a área de transferência",

  // ChildSession
  "childSession.agent": "Agente",
  "childSession.backToParent": "Voltar à sessão principal",

  // Context menu sections
  "input.section.files": "Arquivos",
  "input.section.agents": "Agentes",
  "input.section.shell": "Modo Shell",

  // AgentMention
  "input.noAgents": "Nenhum agente disponível",
};
