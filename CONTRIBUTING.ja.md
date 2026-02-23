[English version](CONTRIBUTING.md)

# OpenCodeGUI へのコントリビュート

コントリビュートに興味を持っていただきありがとうございます！Issue や Pull Request は英語・日本語どちらでも構いません。

## はじめに

### 前提条件

- Node.js v22 以上
- npm
- [OpenCode](https://github.com/opencode-ai/opencode) がインストール済みで、LLM プロバイダの認証が完了していること

### セットアップ

```sh
git clone https://github.com/<your-fork>/OpenCodeGUI.git
cd OpenCodeGUI
npm install
npm run build
```

### テストの実行

```sh
npm test
```

## コントリビュートの方法

### バグ報告・機能リクエスト

作業を開始する前に Issue を立てることを推奨します。[Issue テンプレート](https://github.com/ktmage/OpenCodeGUI/issues/new/choose)を利用してください。

小さな修正（typo、ドキュメント改善など）は直接 PR を出しても構いません。

### Pull Request の出し方

1. リポジトリをフォークする
2. `development` ブランチからブランチを作成する
3. 変更を加える
4. `npm run build` と `npm test` が通ることを確認する
5. `development` ブランチに対して Pull Request を出す

PR は Squash merge でマージされます。

## コードスタイル

現在、Linter や Formatter は導入していません。既存のコードベースのスタイルに合わせてください。

## テスト

動作に影響する変更の場合は、シナリオテストを追加・更新してください。`webview/__tests__/scenarios/` にある既存のテストパターンに習って書いてください。

## レビュー体制

すべての Pull Request はメンテナー（[@ktmage](https://github.com/ktmage)）がレビューします。

## ライセンスへの同意

Pull Request を提出することにより、あなたのコントリビュートがこのプロジェクトの [MIT ライセンス](LICENSE) の下で提供されることに同意したものとみなされます。
