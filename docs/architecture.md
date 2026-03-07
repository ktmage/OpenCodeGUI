# OpenCodeGUI アーキテクチャ

## 概要

OpenCodeGUI は、AI コーディングエージェントと対話するための VS Code 拡張機能を提供するマルチパッケージモノレポです。アーキテクチャは **Core**（共有型定義）、**Agents**（バックエンドアダプター）、**Platforms**（UI + プラットフォーム固有サービス）の3層に関心を分離しています。

```
opencodegui-monorepo/
├── packages/
│   ├── core/                          @opencodegui/core
│   ├── agents/
│   │   └── opencode/                  @opencodegui/agent-opencode
│   └── platforms/
│       └── vscode/                    @opencodegui/vscode
├── package.json                       ワークスペースルート
├── pnpm-workspace.yaml                pnpm ワークスペース設定
└── biome.json                         共有リンター設定
```

## 依存関係グラフ

```
@opencodegui/vscode
  ├── @opencodegui/core          (ドメイン型、インターフェース、プロトコル)
  └── @opencodegui/agent-opencode
        └── @opencodegui/core
            @opencode-ai/sdk     (OpenCode サーバー SDK)
```

重要な制約: **vscode パッケージは `@opencode-ai/sdk` を直接インポートしません**。SDK とのやり取りはすべてエージェントパッケージに隠蔽されています。

---

## パッケージ詳細

### `@opencodegui/core`

依存ゼロの共有コントラクトパッケージ。ランタイムコードなし、型定義のみ。

| モジュール | 説明 |
|-----------|------|
| `domain.ts` | ドメイン型: `ChatSession`, `ChatMessage`, `ChatMessageWithParts`, `MessagePart`, `FileDiff`, `ProviderInfo`, `AgentInfo`, `TodoItem` 等 |
| `agent.interface.ts` | `IAgent` インターフェース + `AgentCapabilities` フラグ |
| `platform.interface.ts` | `IBridge`（UI-ホスト間通信）、`IPlatformServices`（プラットフォーム操作） |
| `protocol.ts` | `UIToHostMessage` / `HostToUIMessage` 判別共用体型 |

### `@opencodegui/agent-opencode`

`@opencode-ai/sdk` をラップし、`IAgent` を実装するアダプター。

| モジュール | 説明 |
|-----------|------|
| `opencode-agent.ts` | `IAgent` を実装する `OpenCodeAgent` クラス — ライフサイクル管理、イベント転送、全エージェント操作 |
| `mappers.ts` | SDK 型 → core ドメイン型への変換関数群 (`mapSession`, `mapMessage`, `mapParts` 等) |

### `@opencodegui/vscode`

Extension Host プロセスと React Webview の両方を含む VS Code 拡張機能。

| モジュール | レイヤー | 説明 |
|-----------|---------|------|
| `src/extension.ts` | Extension Host | エントリーポイント — `OpenCodeAgent`、`VscodePlatformServices` を作成し `ChatViewProvider` を登録 |
| `src/chat-view-provider.ts` | Extension Host | Webview とエージェント/プラットフォームサービス間のメッセージルーター（28以上のハンドラー） |
| `src/vscode-platform-services.ts` | Extension Host | VS Code API を使用した `IPlatformServices` 実装 |
| `webview/bridges/VscodeBridge.ts` | Webview | `acquireVsCodeApi()` をラップする `IBridge` 実装 |
| `webview/App.tsx` | Webview | ルート React コンポーネント |
| `webview/contexts/` | Webview | React コンテキストプロバイダー |
| `webview/hooks/` | Webview | カスタム React フック |
| `webview/components/` | Webview | UI コンポーネント (atoms / molecules / organisms) |

---

## 主要インターフェース

### IAgent

AI コーディングエージェントバックエンドの中心的な抽象化。ケイパビリティ駆動設計により、エージェントがサポートする機能に応じて UI が適応します。

```typescript
interface IAgent {
  getCapabilities(): AgentCapabilities;

  // ライフサイクル
  connect(): Promise<void>;
  disconnect(): void;
  onEvent(handler: (event: AgentEvent) => void): Disposable;

  // セッション
  listSessions(): Promise<ChatSession[]>;
  createSession(title?: string): Promise<ChatSession>;
  getSession(id: string): Promise<ChatSession>;
  deleteSession(id: string): Promise<void>;
  forkSession(sessionId: string, messageId?: string): Promise<ChatSession>;
  // ... revert, unrevert, summarize, share, unshare

  // メッセージ
  getMessages(sessionId: string): Promise<ChatMessageWithParts[]>;
  sendMessage(sessionId: string, text: string, options?: SendMessageOptions): Promise<void>;
  abortSession(sessionId: string): Promise<void>;

  // プロバイダーとモデル
  getProviders(): Promise<{ providers: ProviderInfo[]; default: Record<string, string> }>;

  // ツール、設定、MCP 等
  getToolIds(): Promise<ToolListItem[]>;
  setModel?(model: string): Promise<void>;
}
```

### AgentCapabilities

各エージェント実装が宣言する機能フラグ。UI はこれを読み取って機能の表示/非表示を切り替えます。

```typescript
type AgentCapabilities = {
  sessionDelete: boolean;    // セッション削除
  sessionFork: boolean;      // セッション分岐（任意のメッセージからブランチ）
  sessionRevert: boolean;    // セッション巻き戻し / 巻き戻し解除（Undo / Redo）
  sessionShare: boolean;     // セッション共有（URL 生成）
  sessionSummarize: boolean; // セッション要約 / コンテキスト圧縮
  sessionDiff: boolean;      // セッション単位のファイル差分
  todo: boolean;             // Todo 管理
  multiProvider: boolean;    // マルチプロバイダーモデル選択
  permission: boolean;       // パーミッション管理（ツール実行承認フロー）
  mcp: boolean;              // MCP (Model Context Protocol) サポート
  subAgent: boolean;         // サブエージェント（子セッション）
  shell: boolean;            // シェルコマンド実行
  config: boolean;           // 設定管理 API
};
```

### IBridge

Webview（React）とホストプロセス間の通信チャネル。

```typescript
interface IBridge {
  postMessage(message: UIToHostMessage): void;
  onMessage(handler: (message: HostToUIMessage) => void): Disposable;
  getPersistedState(): UIPersistedState | null;
  setPersistedState(state: UIPersistedState): void;
}
```

### IPlatformServices

Extension Host から抽出されたプラットフォーム固有の操作。

```typescript
interface IPlatformServices {
  openDiffEditor(filePath: string, before: string, after: string): Promise<void>;
  copyToClipboard(text: string): Promise<void>;
  openTerminal(serverUrl: string, sessionId?: string): Promise<void>;
  openConfigFile(filePath: string): Promise<void>;
  searchWorkspaceFiles(query: string): Promise<FileAttachment[]>;
  getOpenEditors(): Promise<FileAttachment[]>;
}
```

---

## メッセージプロトコル

Webview と Extension Host 間の通信は型付き判別共用体を使用します。

### UI -> Host (`UIToHostMessage`)

| タイプ | 説明 |
|-------|------|
| `ready` | Webview の初期化完了 |
| `createSession` | 新規チャットセッション作成 |
| `selectSession` | アクティブセッションの切り替え |
| `deleteSession` | セッション削除 |
| `sendMessage` | エージェントへのユーザーメッセージ送信 |
| `abortSession` | 進行中の生成をキャンセル |
| `setModel` | AI モデルの変更 |
| `compressSession` | コンテキストの要約/圧縮 |
| `undoSession` / `redoSession` | セッション状態の Undo/Redo |
| `forkSession` | メッセージからの分岐 |
| `shareSession` / `unshareSession` | セッションの共有/共有解除 |
| `replyPermission` | ツール実行パーミッションへの応答 |
| `openDiff` | Diff ビューアを開く |
| `copyToClipboard` | テキストをクリップボードにコピー |
| `openTerminal` | エージェント用ターミナルを開く |
| `searchFiles` | ワークスペースファイル検索 |
| `getOpenEditors` | 開いているエディタファイルの取得 |
| `openConfig` | 設定ファイルを開く |
| `revertToMessage` | 特定メッセージへの巻き戻し（レガシー） |

### Host -> UI (`HostToUIMessage`)

| タイプ | 説明 |
|-------|------|
| `init` | 初期状態（ケイパビリティ、ロケール、パス、ツール） |
| `sessions` | セッション一覧 |
| `session` | 単一セッションの更新 |
| `messages` | セッションのメッセージ群 |
| `event` | リアルタイムエージェントイベント（ストリーミングトークン、ツール呼び出し等） |
| `providers` | 利用可能なモデルプロバイダー |
| `allProviders` | 全プロバイダーデータ |
| `agents` | 利用可能なサブエージェント |
| `childSessions` | 親セッションの子セッション |
| `diff` | セッションのファイル差分 |
| `todos` | セッションの Todo アイテム |
| `mcpStatus` | MCP 接続状態 |
| `toolIds` | 利用可能なツール識別子 |
| `searchResults` | ファイル検索結果 |
| `openEditors` | 現在開いているエディタファイル |
| `activeEditor` | フォーカス中のエディタ変更通知 |

---

## データフロー

```
[Webview (React)]
    |
    | UIToHostMessage (IBridge.postMessage 経由)
    v
[ChatViewProvider] -- メッセージルーター (message.type で switch)
    |                    |
    | エージェント操作     | プラットフォーム操作
    v                    v
[IAgent]           [IPlatformServices]
    |                    |
    v                    v
[OpenCodeAgent]    [VscodePlatformServices]
    |                    |
    v                    v
[@opencode-ai/sdk] [VS Code API]
```

### イベントフロー (エージェント -> UI)

```
[@opencode-ai/sdk] -- SSE イベント
    |
    v
[OpenCodeAgent.onEvent()] -- SDK イベントを AgentEvent にマッピング
    |
    v
[ChatViewProvider] -- 登録済みハンドラー
    |
    | HostToUIMessage (webview.postMessage 経由)
    v
[Webview (React)] -- AppContext がフックにディスパッチ
```

---

## 拡張機能のライフサイクル

1. VS Code が拡張機能をアクティベート (`extension.ts:activate`)
2. `OpenCodeAgent` を作成（モジュールスコープのシングルトン）
3. `VscodePlatformServices` を作成
4. `ChatViewProvider` をエージェントとプラットフォームサービスの両方で登録
5. Webview パネルが開いた時:
   - React アプリがマウントされ、`ready` メッセージを送信
   - `ChatViewProvider` が `ready` を処理: `agent.connect()` を呼び出し、セッションを読み込み、`init` メッセージを送信
   - エージェントが OpenCode サーバー (localhost HTTP) に接続
   - エージェントイベントが `HostToUIMessage` 経由で Webview に転送される

---

## ビルドシステム

| コンポーネント | ツール | 設定 |
|-------------|-------|------|
| Core 型定義 | TypeScript (tsc) | `packages/core/tsconfig.json` (composite, declaration) |
| Agent-OpenCode | TypeScript (tsc) | `packages/agents/opencode/tsconfig.json` (composite, declaration) |
| Extension Host | esbuild | `packages/platforms/vscode/esbuild.mjs` |
| Webview (React) | Vite | `packages/platforms/vscode/vite.config.ts` |
| リンティング | Biome | `biome.json` (ルート) |

### ビルド順序

```
pnpm -r build
  1. @opencodegui/core             (tsc)
  2. @opencodegui/agent-opencode   (tsc、core に依存)
  3. @opencodegui/vscode           (esbuild + vite、core + agent に依存)
```

---

## テスト構造

| スイート | ランナー | 設定 | テスト数 |
|---------|---------|------|---------|
| Agent-OpenCode | Vitest | `packages/agents/opencode/vitest.config.ts` | 85 |
| Webview | Vitest + jsdom | `packages/platforms/vscode/vitest.config.ts` | 1475 |
| Extension Host | Vitest | `packages/platforms/vscode/vitest.config.ext.ts` | 54 |
| **合計** | | `pnpm test:all` | **1614** |

### Extension Host テストの注意点

- `vscode` モジュールは `vi.mock("vscode")` で完全にモック化（`src/__tests__/mocks/vscode.ts` 参照）
- モジュールスコープのシングルトン（例: `extension.ts` の `OpenCodeAgent`）はテスト分離のため `vi.resetModules()` + `vi.doMock()` + 動的 `import()` パターンが必要
- 設定ファイルの読み書きテストでは `node:fs/promises` をモック化

---

## 新しいエージェントの追加方法

新しい AI コーディングエージェント（例: Claude Code, Codex）を追加する場合:

1. `packages/agents/<name>/` を作成
2. 適切な `AgentCapabilities` で `IAgent` インターフェースを実装
3. エージェントの SDK 型から core ドメイン型へのマッパー関数を作成
4. vscode パッケージの依存に `@opencodegui/agent-<name>: workspace:*` を追加
5. `extension.ts` を更新して新しいエージェントを作成（またはエージェント選択ロジックを追加）
6. UI は `AgentCapabilities` フラグにより自動的に適応

## 新しいプラットフォームの追加方法

新しいプラットフォーム（例: Electron, Web）を追加する場合:

1. `packages/platforms/<name>/` を作成
2. プラットフォームの UI-ホスト間通信用に `IBridge` を実装
3. プラットフォーム固有の操作用に `IPlatformServices` を実装
4. メッセージルーター（`ChatViewProvider` 相当）で `IAgent` と `IPlatformServices` を接続
5. Webview の React コードは core プロトコル型を通じて共有可能
