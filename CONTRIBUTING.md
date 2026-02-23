[日本語版はこちら / Japanese](CONTRIBUTING.ja.md)

# Contributing to OpenCodeGUI

Thank you for your interest in contributing! Both English and Japanese are welcome in issues and pull requests.

## Getting Started

### Prerequisites

- Node.js v22+
- npm
- [OpenCode](https://github.com/opencode-ai/opencode) installed with LLM provider authentication configured

### Setup

```sh
git clone https://github.com/<your-fork>/OpenCodeGUI.git
cd OpenCodeGUI
npm install
npm run build
```

### Running Tests

```sh
npm test
```

## How to Contribute

### Reporting Bugs / Requesting Features

Opening an issue before starting work is recommended. Use the provided [issue templates](https://github.com/ktmage/OpenCodeGUI/issues/new/choose).

For small fixes (typos, documentation improvements), you may open a PR directly.

### Submitting a Pull Request

1. Fork the repository
2. Create a branch from `develop`
3. Make your changes
4. Ensure `npm run build` and `npm test` pass
5. Open a pull request against `develop`

PRs are squash-merged to keep the commit history clean.

## Code Style

There is no formal linter or formatter configured yet. Please follow the style of the existing codebase.

## Testing

When your change affects behavior, add or update scenario tests. Follow the existing test patterns in `webview/__tests__/scenarios/`.

## Review Process

All pull requests are reviewed by the maintainer ([@ktmage](https://github.com/ktmage)).

## License Agreement

By submitting a pull request, you agree that your contributions are licensed under the [MIT License](LICENSE) that covers this project.
