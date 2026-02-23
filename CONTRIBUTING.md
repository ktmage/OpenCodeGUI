# Contributing to OpenCodeGUI / OpenCodeGUI へのコントリビュート

Thank you for your interest in contributing! Both English and Japanese are welcome in issues and pull requests.

コントリビュートに興味を持っていただきありがとうございます！Issue や Pull Request は英語・日本語どちらでも構いません。

> [!CAUTION]
> **Disclaimer / 免責事項:**
> This project is experimental and developed primarily through AI-assisted coding. It is provided "as-is" without warranty of any kind. There may be unconventional implementations or areas requiring improvement. Your insights and contributions toward improving the codebase are sincerely appreciated.
>
> 本プロジェクトは実験的な取り組みであり、主に AI を活用したコーディングにより開発されています。いかなる保証もなく「現状のまま」提供されます。一般的でない実装や改善が必要な箇所が含まれる可能性があります。コードベースの改善に向けたご意見やコントリビュートをいただけますと幸いです。

## Getting Started / はじめに

### Prerequisites / 前提条件

- Node.js v22+
- npm
- [OpenCode](https://github.com/opencode-ai/opencode) installed with LLM provider authentication configured / インストール済みで、LLM プロバイダの認証が完了していること

### Setup / セットアップ

```sh
git clone https://github.com/<your-fork>/OpenCodeGUI.git
cd OpenCodeGUI
npm install
npm run build
```

### Running Tests / テストの実行

```sh
npm test
```

## How to Contribute / コントリビュートの方法

### Reporting Bugs / Requesting Features / バグ報告・機能リクエスト

Opening an issue before starting work is recommended. Use the provided [issue templates](https://github.com/ktmage/OpenCodeGUI/issues/new/choose).

作業を開始する前に Issue を立てることを推奨します。[Issue テンプレート](https://github.com/ktmage/OpenCodeGUI/issues/new/choose)を利用してください。

For small fixes (typos, documentation improvements), you may open a PR directly. / 小さな修正（typo、ドキュメント改善など）は直接 PR を出しても構いません。

### Submitting a Pull Request / Pull Request の出し方

1. Fork the repository / リポジトリをフォークする
2. Create a branch from `development` / `development` ブランチからブランチを作成する
3. Make your changes / 変更を加える
4. Ensure `npm run build` and `npm test` pass / `npm run build` と `npm test` が通ることを確認する
5. Open a pull request against `development` / `development` ブランチに対して Pull Request を出す

PRs are squash-merged to keep the commit history clean. / PR は Squash merge でマージされます。

## Code Style / コードスタイル

There is no formal linter or formatter configured yet. Please follow the style of the existing codebase.

現在、Linter や Formatter は導入していません。既存のコードベースのスタイルに合わせてください。

## Testing / テスト

When your change affects behavior, add or update scenario tests. Follow the existing test patterns in `webview/__tests__/scenarios/`.

動作に影響する変更の場合は、シナリオテストを追加・更新してください。`webview/__tests__/scenarios/` にある既存のテストパターンに習って書いてください。

## Review Process / レビュー体制

All pull requests are reviewed by the maintainer ([@ktmage](https://github.com/ktmage)).

すべての Pull Request はメンテナー（[@ktmage](https://github.com/ktmage)）がレビューします。

## License Agreement / ライセンスへの同意

By submitting a pull request, you agree that your contributions are licensed under the [MIT License](LICENSE) that covers this project.

Pull Request を提出することにより、あなたのコントリビュートがこのプロジェクトの [MIT ライセンス](LICENSE) の下で提供されることに同意したものとみなされます。
