# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.4.2] - 2026-03-08

### Added

- Compact inline permission queue UI matching TodoHeader/FileChangesHeader design (#92)
- ShieldIcon for permission header bar
- `permission.title` locale key for all 8 languages

### Changed

- Migrated opencode agent from SDK v1 to v2 (`@opencode-ai/sdk/v2`) for compatibility with opencode server v1.2.20 (#92)
- Permission UI moved from inline message display to dedicated queue above InputArea

### Fixed

- Permission requests not displayed in Webview UI, causing session hang (#91, #92)
- Child session permissions not visible due to messageID-based filtering

## [0.4.1] - 2026-03-08

### Added

- Sound notification on question asked event with locale keys for all languages (#88)

### Fixed

- Sub-agent messages leaking into parent session (#86)

## [0.4.0] - 2026-03-08

### Added

- File path links in tool and text views — clickable file chips with extension-based icons (#81)
- Diff review feature using difit for session file changes (#82)
- Sound notification on assistant response completion
- Question interaction UI (QuestionView) for agent-initiated questions
- Agent selector UI for primary agent selection
- Shell/agent chips repositioned after clip button (#83)

### Changed

- Monorepo architecture — migrated to pnpm workspaces with `@opencodegui/core`, `@opencodegui/agent-opencode`, and platform abstraction layer (VscodeBridge / VscodePlatformServices)
- Architecture documentation added
- ContextIndicator component removed (context limit UI)
- Default notification sound volume reduced from 0.5 to 0.2

### Fixed

- Unintended horizontal scrolling from tilt scroll
- Overscroll behavior on MessagesArea
- File chip icon and text vertical alignment
- CI environment test failures for extension tests
- Test setup compatibility with vitest 4.x (`@testing-library/jest-dom` ESM import)

## [0.3.0] - 2026-03-02

### Added

- Auto-scroll during message streaming (#41)
- Quick-add button shows active editor file in real-time (#40)
- Unified context menu for clip button with shell mode and agent mention (#42)
- File type icons for file name displays (#45)
- Multi-language locale support: Simplified Chinese, Korean, Traditional Chinese, Spanish, Brazilian Portuguese, Russian (#47)
- Syntax highlighting for code blocks with highlight.js (#54)
- Copy button for code blocks (#54)
- Input history navigation with ArrowUp/ArrowDown (#60)

### Changed

- Terminal button tooltip text clarified to "Open session in terminal" (#43)
- File changes list limited to max-height with scrollbar (#55)
- Input area expanded vertically with centered text input (#59)
- Markdown list item margins compacted (#54)
- Nested code block rendering improved (#54)

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

[Unreleased]: https://github.com/ktmage/opencode-gui/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/ktmage/opencode-gui/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/ktmage/opencode-gui/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/ktmage/opencode-gui/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/ktmage/opencode-gui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ktmage/opencode-gui/releases/tag/v0.1.0
