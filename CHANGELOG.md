# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-03-01

### Added

- Message editing & checkpoint restore
- Reasoning / thinking display
- Shell command execution
- File changes diff view
- Session fork
- Child session navigation (subtask)
- Subtask display for task tool calls
- Agent mention (`@` mention)
- Session sharing
- Undo / Redo
- Settings panel
- Keyboard navigation for inline popups (Tab / Arrow keys)
- Biome as linter/formatter
- DOMPurify for XSS protection
- CSS Modules for component styling

### Changed

- Replace hardcoded SVG icons with react-icons/vsc
- UI component architecture refactored to Atoms/Molecules/Organisms
- Todo display migrated from message parsing to session.todo() API
- OpenCode repository URL updated (opencode-ai → anomalyco)
- Repository URL updated to opencode-gui

### Fixed

- Markdown CSS scoped to `.markdown` class to prevent style bleeding

## [0.1.0] - 2026-02-24

### Added

- Chat UI (send/receive messages, streaming display)
- Markdown rendering
- Tool call collapsible display
- Permission approval UI (Allow / Once / Deny)
- Session management (create, switch, delete)
- Model selection
- File context attachment
- Context compression indicator
- Todo display
- i18n support (English, Japanese)

[Unreleased]: https://github.com/ktmage/opencode-gui/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ktmage/opencode-gui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ktmage/opencode-gui/releases/tag/v0.1.0
