# Contributing to OpenCodeGUI

OpenCodeGUI へのコントリビュートについて

## Table of Contents / 目次

- [English](#english)
- [日本語](#japanese)

<a id="english"></a>
## English

Thank you for your interest in contributing! Both English and Japanese are welcome in issues and pull requests.

This project itself is developed primarily through AI-assisted coding, and we welcome contributions made with AI tools as well. Whether you write code by hand or with the help of AI, all contributions are equally valued. Beginners are also very welcome — don't hesitate to open an issue or submit a PR, even if it's your first time contributing to open source.

> [!CAUTION]
> **Disclaimer:**
> This project is experimental and developed primarily through AI-assisted coding. It is provided "as-is" without warranty of any kind. There may be unconventional implementations or areas requiring improvement. Your insights and contributions toward improving the codebase are sincerely appreciated.

### Getting Started

#### Prerequisites

- Node.js v22+
- npm
- [OpenCode](https://github.com/anomalyco/opencode) installed with LLM provider authentication configured

#### Setup

```sh
git clone https://github.com/<your-fork>/OpenCodeGUI.git
cd OpenCodeGUI
npm install
npm run build
```

#### Running Tests

```sh
npm test
```

### How to Contribute

#### Reporting Bugs / Requesting Features

Opening an issue before starting work is recommended. Use the provided [issue templates](https://github.com/ktmage/OpenCodeGUI/issues/new/choose).

For small fixes (typos, documentation improvements), you may open a PR directly.

#### Submitting a Pull Request

1. Fork the repository
2. Create a branch from `development`
3. Make your changes
4. Ensure `npm run check`, `npm run build` and `npm test` pass
5. Open a pull request against `development`

PRs are squash-merged to keep the commit history clean.

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. Run the following before submitting a PR:

```sh
npm run check
```

To auto-fix issues:

```sh
npm run check:fix
```

### Testing

When your change affects behavior, add or update tests. Follow existing test patterns:

- **Scenario tests:** `webview/__tests__/scenarios/`
- **Component unit tests:** `webview/__tests__/components/`
- **Hook unit tests:** `webview/__tests__/hooks/`
- **Utility tests:** `webview/__tests__/utils/`

### Review Process

All pull requests are reviewed by the maintainer ([@ktmage](https://github.com/ktmage)).

### License Agreement

By submitting a pull request, you agree that your contributions are licensed under the [MIT License](LICENSE) that covers this project.

<a id="japanese"></a>
## 日本語

コントリビュートに興味を持っていただきありがとうございます！Issue や Pull Request は英語・日本語どちらでも構いません。

本プロジェクト自体が主に AI を活用したコーディングで開発されており、AI ツールを使ったコントリビュートも歓迎します。手書きでも AI の助けを借りても、すべてのコントリビュートを同等に評価します。初心者の方も大歓迎です。オープンソースへのコントリビュートが初めてでも、気軽に Issue や PR を出してください。

> [!CAUTION]
> **免責事項：**
> 本プロジェクトは実験的な取り組みであり、主に AI を活用したコーディングにより開発されています。いかなる保証もなく「現状のまま」提供されます。一般的でない実装や改善が必要な箇所が含まれる可能性があります。コードベースの改善に向けたご意見やコントリビュートをいただけますと幸いです。

### はじめに

#### 前提条件

- Node.js v22+
- npm
- [OpenCode](https://github.com/anomalyco/opencode) がインストール済みで、LLM プロバイダの認証が完了していること

#### セットアップ

```sh
git clone https://github.com/<your-fork>/OpenCodeGUI.git
cd OpenCodeGUI
npm install
npm run build
```

#### テストの実行

```sh
npm test
```

### コントリビュートの方法

#### バグ報告・機能リクエスト

作業を開始する前に Issue を立てることを推奨します。[Issue テンプレート](https://github.com/ktmage/OpenCodeGUI/issues/new/choose)を利用してください。

小さな修正（typo、ドキュメント改善など）は直接 PR を出しても構いません。

#### Pull Request の出し方

1. リポジトリをフォークする
2. `development` ブランチからブランチを作成する
3. 変更を加える
4. `npm run check`、`npm run build`、`npm test` が通ることを確認する
5. `development` ブランチに対して Pull Request を出す

PR は Squash merge でマージされます。

### コードスタイル

本プロジェクトでは [Biome](https://biomejs.dev/) を Linter/Formatter として使用しています。PR を出す前に以下を実行してください:

```sh
npm run check
```

問題を自動修正するには:

```sh
npm run check:fix
```

### テスト

動作に影響する変更の場合は、テストを追加・更新してください。既存のテストパターンに習って書いてください:

- **シナリオテスト:** `webview/__tests__/scenarios/`
- **コンポーネント単体テスト:** `webview/__tests__/components/`
- **フック単体テスト:** `webview/__tests__/hooks/`
- **ユーティリティテスト:** `webview/__tests__/utils/`

### レビュー体制

すべての Pull Request はメンテナー（[@ktmage](https://github.com/ktmage)）がレビューします。

### ライセンスへの同意

Pull Request を提出することにより、あなたのコントリビュートがこのプロジェクトの [MIT ライセンス](LICENSE) の下で提供されることに同意したものとみなされます。
