# OpenCodeGUI

An unofficial VS Code sidebar chat interface for [OpenCode](https://github.com/anomalyco/opencode).

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

### Demo

![Demo](media/demo.gif)

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
- Session management (create, switch, fork, delete)
- Message editing & checkpoint restore
- Model selection
- Agent selector for primary agent selection
- File context attachment
- File changes diff view
- Session diff review via [difit](https://github.com/yoshiko-pg/difit) (opens in browser)
- Shell command execution
- Reasoning / thinking display
- Todo display
- Undo / Redo
- Session sharing
- Agent mention (`@` mention)
- Child session navigation (subtask)
- Settings panel
- Keyboard navigation for inline popups (Tab / Arrow keys)
- Subtask display
- Auto-scroll during streaming
- File type icons
- File path links (clickable file chips with extension-based icons)
- Syntax highlighting and copy button for code blocks
- Quick-add button with active editor file
- Input history navigation (ArrowUp / ArrowDown)
- Sound notification on assistant response completion
- Question interaction UI for agent-initiated questions
- i18n support (English, Japanese, Simplified Chinese, Korean, Traditional Chinese, Spanish, Brazilian Portuguese, Russian)

### Requirements

- [OpenCode](https://github.com/anomalyco/opencode) installed
- LLM provider authentication configured in OpenCode

#### Optional

- [difit](https://github.com/yoshiko-pg/difit) — enables the session diff review feature. Install with `npm install -g difit`.

### Installation

Search for **OpenCodeGUI** in the VS Code Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`) and click **Install**.

### Development

#### Prerequisites

- Node.js v22+
- [pnpm](https://pnpm.io/) v10+

#### Setup

```sh
pnpm install
pnpm run build
```

#### Build

```sh
# Full build (all packages)
pnpm run build

# Extension only (from packages/platforms/vscode)
pnpm --filter opencodegui run build:ext

# Webview only (from packages/platforms/vscode)
pnpm --filter opencodegui run build:webview
```

#### Watch Mode

Open two terminals and run each:

```sh
# Terminal 1: Extension watch
pnpm --filter opencodegui run watch:ext

# Terminal 2: Webview watch
pnpm --filter opencodegui run watch:webview
```

#### Lint & Format

```sh
pnpm run check
```

#### Debug

1. Run `pnpm run build`
2. Press `F5` in VS Code to launch the Extension Development Host
3. Click the OpenCode icon in the sidebar to open the chat panel

#### Test

```sh
pnpm test
```

### Project Structure

This project is a pnpm monorepo with the following packages:

```
packages/
  core/                   # @opencodegui/core — Domain types, interfaces & protocol
    src/
      domain.ts           # Domain types (messages, sessions, tools, permissions)
      agent.interface.ts  # IAgent interface
      platform.interface.ts # IPlatformServices interface
      protocol.ts         # Webview ↔ Extension messaging protocol

  agents/
    opencode/             # @opencodegui/agent-opencode — OpenCode SDK adapter
      src/
        opencode-agent.ts # IAgent implementation for OpenCode
        mappers.ts        # SDK ↔ domain type mappers

  platforms/
    vscode/               # opencodegui — VS Code extension
      src/
        extension.ts      # Extension entry point
        chat-view-provider.ts   # Webview panel & messaging
        vscode-platform-services.ts # IPlatformServices implementation
      webview/            # Webview (Browser, React)
        App.tsx           # State management & SSE event handling
        components/       # React components (Atoms / Molecules / Organisms)
        hooks/            # Custom React hooks
        contexts/         # React Context providers
        locales/          # i18n locale files
        utils/            # Utility functions
        __tests__/        # Tests (unit, scenario)
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

### デモ

![デモ](media/demo.gif)

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
- セッション管理（作成、切替、フォーク、削除）
- メッセージ編集とチェックポイント復元
- モデル選択
- エージェントセレクター（プライマリエージェント選択）
- ファイルコンテキスト添付
- ファイル変更差分表示
- [difit](https://github.com/yoshiko-pg/difit) によるセッション差分レビュー（ブラウザで表示）
- シェルコマンド実行
- 推論（思考過程）表示
- Todo 表示
- Undo / Redo
- セッション共有
- エージェントメンション（`@` メンション）
- 子セッションナビゲーション（サブタスク）
- 設定パネル
- インラインポップアップのキーボードナビゲーション（Tab / 矢印キー）
- サブタスク表示
- ストリーミング中の自動スクロール
- ファイルタイプアイコン
- ファイルパスリンク（拡張子別アイコン付きクリッカブルチップ）
- コードブロックのシンタックスハイライト・コピーボタン
- Quick-add ボタン（アクティブエディタのファイル表示）
- 入力履歴ナビゲーション（ArrowUp / ArrowDown）
- サウンド通知（アシスタント応答完了時）
- 質問インタラクション UI（エージェントからの質問対応）
- 多言語対応（英語、日本語、簡体字中国語、韓国語、繁体字中国語、スペイン語、ブラジルポルトガル語、ロシア語）

### 必要条件

- [OpenCode](https://github.com/anomalyco/opencode) がインストール済みであること
- OpenCode 側で LLM プロバイダの認証が完了していること

#### オプション

- [difit](https://github.com/yoshiko-pg/difit) — セッション差分レビュー機能を有効にします。`npm install -g difit` でインストール。

### インストール

VS Code の拡張機能ビュー（`Ctrl+Shift+X` / `Cmd+Shift+X`）で **OpenCodeGUI** を検索し、**Install** をクリック。

### 開発

#### 前提条件

- Node.js v22+
- [pnpm](https://pnpm.io/) v10+

#### セットアップ

```sh
pnpm install
pnpm run build
```

#### ビルド

```sh
# 全体ビルド（全パッケージ）
pnpm run build

# Extension のみ（packages/platforms/vscode から）
pnpm --filter opencodegui run build:ext

# Webview のみ（packages/platforms/vscode から）
pnpm --filter opencodegui run build:webview
```

#### Watch モード

ターミナルを 2 つ開いて、それぞれ実行する。

```sh
# Terminal 1: Extension watch
pnpm --filter opencodegui run watch:ext

# Terminal 2: Webview watch
pnpm --filter opencodegui run watch:webview
```

#### リント & フォーマット

```sh
pnpm run check
```

#### デバッグ実行

1. `pnpm run build` でビルドする
2. VS Code で `F5` を押して Extension Development Host を起動する
3. サイドバーの OpenCode アイコンをクリックしてチャットパネルを開く

#### テスト

```sh
pnpm test
```

### プロジェクト構造

本プロジェクトは pnpm モノレポ構成です。

```
packages/
  core/                   # @opencodegui/core — ドメイン型・インターフェース・プロトコル
    src/
      domain.ts           # ドメイン型（メッセージ、セッション、ツール、パーミッション）
      agent.interface.ts  # IAgent インターフェース
      platform.interface.ts # IPlatformServices インターフェース
      protocol.ts         # Webview ↔ Extension メッセージングプロトコル

  agents/
    opencode/             # @opencodegui/agent-opencode — OpenCode SDK アダプター
      src/
        opencode-agent.ts # OpenCode 用 IAgent 実装
        mappers.ts        # SDK ↔ ドメイン型マッパー

  platforms/
    vscode/               # opencodegui — VS Code 拡張機能
      src/
        extension.ts      # 拡張機能エントリーポイント
        chat-view-provider.ts   # Webview パネル & メッセージング
        vscode-platform-services.ts # IPlatformServices 実装
      webview/            # Webview (Browser, React)
        App.tsx           # 状態管理 & SSE イベントハンドリング
        components/       # React コンポーネント（Atoms / Molecules / Organisms）
        hooks/            # カスタム React フック
        contexts/         # React Context プロバイダー
        locales/          # i18n ロケールファイル
        utils/            # ユーティリティ関数
        __tests__/        # テスト（単体、シナリオ）
```

### コントリビュート

このプロジェクトへの貢献を歓迎します。詳しくは [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

### ライセンス

[MIT](LICENSE)
