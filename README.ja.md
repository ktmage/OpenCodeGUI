[English version](README.md)

# OpenCodeGUI

[OpenCode](https://github.com/opencode-ai/opencode) の VS Code チャットインターフェース。GitHub Copilot ライクな UI/UX で、OpenCode の全機能をサイドバーから操作できる。

## 機能

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

## 必要条件

- [OpenCode](https://github.com/opencode-ai/opencode) がインストール済みであること
- OpenCode 側で LLM プロバイダの認証が完了していること

## インストール

VS Code の拡張機能ビュー（`Ctrl+Shift+X` / `Cmd+Shift+X`）で **OpenCodeGUI** を検索し、**Install** をクリック。

## 開発

### 前提条件

- Node.js v22 以上
- npm

### セットアップ

```sh
npm install
npm run build
```

### ビルド

```sh
# 全体ビルド（Extension + Webview）
npm run build

# Extension のみ
npm run build:ext

# Webview のみ
npm run build:webview
```

### Watch モード

ターミナルを 2 つ開いて、それぞれ実行する。

```sh
# ターミナル 1: Extension の watch
npm run watch:ext

# ターミナル 2: Webview の watch
npm run watch:webview
```

### デバッグ実行

1. `npm run build` でビルドする
2. VS Code で `F5` を押して Extension Development Host を起動する
3. サイドバーの OpenCode アイコンをクリックしてチャットパネルを開く

### テスト

```sh
npm test
```

## プロジェクト構造

```
src/                      # Extension Host（Node.js 側）
  extension.ts            # エントリポイント
  opencode-client.ts      # OpenCode サーバー接続管理
  chat-view-provider.ts   # Webview パネルと通信プロトコル

webview/                  # Webview（ブラウザ側、React）
  main.tsx                # React エントリポイント
  App.tsx                 # 状態管理と SSE イベントハンドリング
  vscode-api.ts           # VS Code Webview API ラッパー
  styles.css              # VS Code テーマ変数によるスタイル
  components/             # React コンポーネント群

dist/                     # ビルド出力（git 管理外）
  extension.js            # Extension バンドル
  webview/                # Webview バンドル

esbuild.mjs               # Extension ビルド設定
vite.config.ts             # Webview ビルド設定
```

## コントリビュート

詳しくは [CONTRIBUTING.ja.md](CONTRIBUTING.ja.md) を参照。

## ライセンス

[MIT](LICENSE)
