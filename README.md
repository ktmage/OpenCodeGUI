# OpenCodeGUI

An unofficial VS Code sidebar chat interface for [OpenCode](https://github.com/opencode-ai/opencode). Use all OpenCode features from a familiar sidebar chat UI.

[OpenCode](https://github.com/opencode-ai/opencode) の非公式 VS Code サイドバーチャットインターフェース。OpenCode の全機能をサイドバーのチャット UI から操作できる。

> **This is an unofficial, community-developed extension. It is not affiliated with or endorsed by the OpenCode project.**
>
> **本拡張機能は非公式のコミュニティ開発プロジェクトです。OpenCode プロジェクトとは提携・推薦関係にありません。**

> [!CAUTION]
> **Disclaimer / 免責事項:**
> This project is experimental and developed primarily through AI-assisted coding. It is provided "as-is" without warranty of any kind. It may contain unexpected behavior, unconventional implementations, or undiscovered defects. Use at your own risk. The authors assume no liability for any damages arising from the use of this software.
>
> 本プロジェクトは実験的な取り組みであり、主に AI を活用したコーディングにより開発されています。いかなる保証もなく「現状のまま」提供されます。予期しない動作、一般的でない実装、未発見の不具合が含まれる可能性があります。ご利用は自己責任でお願いいたします。本ソフトウェアの使用により生じたいかなる損害についても、作者は一切の責任を負いません。

## Documents / ドキュメント

| File | Description |
|------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributing guide / コントリビュートガイド |
| [CHANGELOG.md](CHANGELOG.md) | Release history / リリース履歴 |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | Third-party licenses / サードパーティライセンス |
| [LICENSE](LICENSE) | MIT License |

## Features / 機能

- Chat UI (send/receive messages, streaming display) / チャット UI（メッセージ送受信、ストリーミング表示）
- Markdown rendering / Markdown レンダリング
- Tool call collapsible display / ツールコールの折りたたみ表示
- Permission approval UI (Allow / Once / Deny) / パーミッション承認 UI
- Session management (create, switch, delete) / セッション管理（作成、切替、削除）
- Model selection / モデル選択
- File context attachment / ファイルコンテキスト添付
- Context compression indicator / コンテキスト圧縮インジケーター
- Todo display / Todo 表示
- i18n support (English, Japanese) / 多言語対応（英語、日本語）

## Requirements / 必要条件

- [OpenCode](https://github.com/opencode-ai/opencode) installed / インストール済みであること
- LLM provider authentication configured in OpenCode / OpenCode 側で LLM プロバイダの認証が完了していること

## Installation / インストール

Search for **OpenCodeGUI** in the VS Code Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`) and click **Install**.

VS Code の拡張機能ビュー（`Ctrl+Shift+X` / `Cmd+Shift+X`）で **OpenCodeGUI** を検索し、**Install** をクリック。

## Development / 開発

### Prerequisites / 前提条件

- Node.js v22+
- npm

### Setup / セットアップ

```sh
npm install
npm run build
```

### Build / ビルド

```sh
# Full build (Extension + Webview) / 全体ビルド
npm run build

# Extension only / Extension のみ
npm run build:ext

# Webview only / Webview のみ
npm run build:webview
```

### Watch Mode / Watch モード

Open two terminals and run each: / ターミナルを 2 つ開いて、それぞれ実行する。

```sh
# Terminal 1: Extension watch
npm run watch:ext

# Terminal 2: Webview watch
npm run watch:webview
```

### Debug / デバッグ実行

1. Run `npm run build` / `npm run build` でビルドする
2. Press `F5` in VS Code to launch the Extension Development Host / VS Code で `F5` を押して Extension Development Host を起動する
3. Click the OpenCode icon in the sidebar to open the chat panel / サイドバーの OpenCode アイコンをクリックしてチャットパネルを開く

### Test / テスト

```sh
npm test
```

## Project Structure / プロジェクト構造

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

## Contributing / コントリビュート

See [CONTRIBUTING.md](CONTRIBUTING.md) for details. / 詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) を参照。

## License / ライセンス

[MIT](LICENSE)
