## OpenCodeGUI

OpenCode の VSCode チャットインターフェース。GitHub Copilot ライクな UI/UX で、OpenCode の全機能をサイドバーから操作できる。

## 前提条件

- Node.js v22 以上
- npm
- [OpenCode](https://github.com/opencode-ai/opencode) がインストール済みであること
- OpenCode 側で LLM プロバイダの認証が完了していること

## セットアップ

```sh
# 依存パッケージのインストール
npm install

# Extension と Webview をビルド
npm run build
```

## 開発

### ビルド

```sh
# 全体ビルド（Extension + Webview）
npm run build

# Extension のみビルド
npm run build:ext

# Webview のみビルド
npm run build:webview
```

### Watch モード

ターミナルを 2 つ開いて、それぞれ実行する。

```sh
# Extension の watch
npm run watch:ext

# Webview の watch
npm run watch:webview
```

### デバッグ実行

1. `npm run build` でビルドする
2. VSCode で `F5` を押して Extension Development Host を起動する
3. サイドバーの OpenCode アイコンをクリックしてチャットパネルを開く

## プロジェクト構造

```
src/                      # Extension Host（Node.js 側）
  extension.ts            # エントリポイント
  opencode-client.ts      # OpenCode サーバー接続管理
  chat-view-provider.ts   # Webview パネルと通信プロトコル

webview/                  # Webview（ブラウザ側、React）
  main.tsx                # React エントリポイント
  App.tsx                 # 状態管理と SSE イベントハンドリング
  vscode-api.ts           # VSCode Webview API ラッパー
  styles.css              # VSCode テーマ変数によるスタイル
  components/             # React コンポーネント群

dist/                     # ビルド出力（git 管理外）
  extension.js            # Extension バンドル
  webview/                # Webview バンドル

esbuild.mjs               # Extension ビルド設定
vite.config.ts             # Webview ビルド設定
```

## 機能

- チャット UI（メッセージ送受信、ストリーミング表示）
- Markdown レンダリング
- ツールコールの折りたたみ表示
- パーミッション承認 UI（Allow / Once / Deny）
- セッション管理（作成、切替、削除）
