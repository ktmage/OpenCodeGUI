# OpenCodeGUI

An unofficial VS Code sidebar chat interface for [OpenCode](https://github.com/opencode-ai/opencode).

OpenCode の非公式 VS Code サイドバーチャットインターフェース。

## Table of Contents / 目次

- [English](#english)
- [日本語](#japanese)

<a id="english"></a>
## English

### OpenCodeGUI

Use all OpenCode features from a familiar sidebar chat UI.

> **This is an unofficial, community-developed extension. It is not affiliated with or endorsed by the OpenCode project.**

> [!CAUTION]
> **Disclaimer:**
> This project is experimental and developed primarily through AI-assisted coding. It is provided "as-is" without warranty of any kind. It may contain unexpected behavior, unconventional implementations, or undiscovered defects. Use at your own risk. The authors assume no liability for any damages arising from the use of this software.

### Documents

| File | Description |
|------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributing guide |
| [CHANGELOG.md](CHANGELOG.md) | Release history |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | Third-party licenses |
| [LICENSE](LICENSE) | MIT License |

### Features

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

### Requirements

- [OpenCode](https://github.com/opencode-ai/opencode) installed
- LLM provider authentication configured in OpenCode

### Installation

Search for **OpenCodeGUI** in the VS Code Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`) and click **Install**.

### Development

#### Prerequisites

- Node.js v22+
- npm

#### Setup

```sh
npm install
npm run build
```

#### Build

```sh
# Full build (Extension + Webview)
npm run build

# Extension only
npm run build:ext

# Webview only
npm run build:webview
```

#### Watch Mode

Open two terminals and run each:

```sh
# Terminal 1: Extension watch
npm run watch:ext

# Terminal 2: Webview watch
npm run watch:webview
```

#### Debug

1. Run `npm run build`
2. Press `F5` in VS Code to launch the Extension Development Host
3. Click the OpenCode icon in the sidebar to open the chat panel

#### Test

```sh
npm test
```

### Project Structure

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

### Contributing

Contributions to this project are welcome. For details, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

### License

[MIT](LICENSE)

<a id="japanese"></a>
## 日本語

### OpenCodeGUI

OpenCode の全機能をサイドバーのチャット UI から操作できます。

> **本拡張機能は非公式のコミュニティ開発プロジェクトです。OpenCode プロジェクトとは提携・推薦関係にありません。**

> [!CAUTION]
> **免責事項：**
> 本プロジェクトは実験的な取り組みであり、主に AI を活用したコーディングにより開発されています。いかなる保証もなく「現状のまま」提供されます。予期しない動作、一般的でない実装、未発見の不具合が含まれる可能性があります。ご利用は自己責任でお願いいたします。本ソフトウェアの使用により生じたいかなる損害についても、作者は一切の責任を負いません。

### ドキュメント

| ファイル | 説明 |
|------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | コントリビュートガイド |
| [CHANGELOG.md](CHANGELOG.md) | リリース履歴 |
| [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) | サードパーティライセンス |
| [LICENSE](LICENSE) | MIT ライセンス |

### 機能

- チャット UI（メッセージ送受信、ストリーミング表示）
- Markdown レンダリング
- ツールコールの折りたたみ表示
- パーミッション承認 UI（Allow / Once / Deny）
- セッション管理（作成、切替、削除）
- モデル選択
- ファイルコンテキスト添付
- コンテキスト圧縮インジケーター
- Todo 表示
- 多言語対応（英語、日本語）

### 必要条件

- [OpenCode](https://github.com/opencode-ai/opencode) がインストール済みであること
- OpenCode 側で LLM プロバイダの認証が完了していること

### インストール

VS Code の拡張機能ビュー（`Ctrl+Shift+X` / `Cmd+Shift+X`）で **OpenCodeGUI** を検索し、**Install** をクリック。

### 開発

#### 前提条件

- Node.js v22+
- npm

#### セットアップ

```sh
npm install
npm run build
```

#### ビルド

```sh
# 全体ビルド（Extension + Webview）
npm run build

# Extension のみ
npm run build:ext

# Webview のみ
npm run build:webview
```

#### Watch モード

ターミナルを 2 つ開いて、それぞれ実行する。

```sh
# Terminal 1: Extension watch
npm run watch:ext

# Terminal 2: Webview watch
npm run watch:webview
```

#### デバッグ実行

1. `npm run build` でビルドする
2. VS Code で `F5` を押して Extension Development Host を起動する
3. サイドバーの OpenCode アイコンをクリックしてチャットパネルを開く

#### テスト

```sh
npm test
```

### プロジェクト構造

```
src/                      # Extension Host (Node.js)
  extension.ts            # エントリーポイント
  opencode-client.ts      # OpenCode サーバー接続
  chat-view-provider.ts   # Webview パネル & メッセージングプロトコル

webview/                  # Webview (ブラウザ, React)
  main.tsx                # React エントリーポイント
  App.tsx                 # 状態管理 & SSE イベントハンドリング
  vscode-api.ts           # VS Code Webview API ラッパー
  styles.css              # VS Code テーマ変数を使ったスタイル
  components/             # React コンポーネント

dist/                     # ビルド出力（git 管理外）
  extension.js            # Extension バンドル
  webview/                # Webview バンドル

esbuild.mjs               # Extension ビルド設定
vite.config.ts             # Webview ビルド設定
```

### コントリビュート

このプロジェクトへの貢献を歓迎します。詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

### ライセンス

[MIT](LICENSE)
