[日本語版はこちら / Japanese](README.ja.md)

# OpenCodeGUI

A VS Code chat interface for [OpenCode](https://github.com/opencode-ai/opencode). GitHub Copilot-like UI/UX that lets you use all OpenCode features from the sidebar.

## Features

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

## Requirements

- [OpenCode](https://github.com/opencode-ai/opencode) installed
- LLM provider authentication configured in OpenCode

## Installation

Search for **OpenCodeGUI** in the VS Code Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`) and click **Install**.

## Development

### Prerequisites

- Node.js v22+
- npm

### Setup

```sh
npm install
npm run build
```

### Build

```sh
# Full build (Extension + Webview)
npm run build

# Extension only
npm run build:ext

# Webview only
npm run build:webview
```

### Watch Mode

Open two terminals and run each:

```sh
# Terminal 1: Extension watch
npm run watch:ext

# Terminal 2: Webview watch
npm run watch:webview
```

### Debug

1. Run `npm run build`
2. Press `F5` in VS Code to launch the Extension Development Host
3. Click the OpenCode icon in the sidebar to open the chat panel

### Test

```sh
npm test
```

## Project Structure

```
src/                      # Extension Host (Node.js)
  extension.ts            # Entry point
  opencode-client.ts      # OpenCode server connection
  chat-view-provider.ts   # Webview panel & messaging protocol

webview/                  # Webview (Browser, React)
  main.tsx                # React entry point
  App.tsx                 # State management & SSE event handling
  vscode-api.ts           # VS Code Webview API wrapper
  styles.css              # Styles using VS Code theme variables
  components/             # React components

dist/                     # Build output (not tracked by git)
  extension.js            # Extension bundle
  webview/                # Webview bundle

esbuild.mjs               # Extension build config
vite.config.ts             # Webview build config
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE)
