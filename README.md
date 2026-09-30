# pro_shunsuke.

[日本語](README.md) | [English](README.en.md)

職務経歴書とブログの個人サイト。公開先: https://proshunsuke.github.io/

このサイトについて: https://proshunsuke.github.io/about/

## ローカル開発

miseをインストールした環境で、以下を実行します。

```fish
mise trust
mise install node
mise run install
mise run dev
```

開発・CIのコマンドはmise経由で実行します。タスク名は使用ツールに依存しない操作名で統一し、ツールを変更する場合も呼び出し方を維持します。現在はNode.jsをmise、依存関係をnpm、フロントエンドのツールチェーンをVite+ 1.0.0で管理しています。

- `mise run check`: lint、整形チェック、型検査、Vitest（Node・Browser Mode）
- `mise run check:static`: lint、整形チェック、型検査
- `mise run typecheck`: 型生成と型検査
- `mise run lint`: Oxlintによる検査
- `mise run format`: Oxfmtによる整形
- `mise run format:check`: ファイルを書き換えずに整形を検査
- `mise run build`: 全ページの静的生成。成果物は `build/client/`
- `mise run preview`: ビルド済みサイトの確認
- `mise run build:verify`: 公開成果物の検証（ビルド後）
- `mise run assets:generate`: OG画像の生成
- `mise run auth:check`: OAuth Workerの型検査、テスト、ビルド

実行するコマンドは `mise.toml` に定義しています。開発・ビルド・テスト時にはOG画像生成の前処理も実行します。lint・format設定は `vite.config.ts`、React Routerのプラグイン構成から分離したテスト設定は `vitest.config.ts` で管理します。OAuth Workerは独立したnpmパッケージとして管理します。

## テスト

初回とテスト用ブラウザの更新後に `mise run test:setup` でテスト環境を準備します。CIのNode・Browserテスト用の準備は `mise run test:setup:ci` で行います。

macOS 27では、Firefoxのデータフォルダへのアクセス制限により `Could not find profile folder` で起動に失敗する場合があります（[Playwright #42768](https://github.com/microsoft/playwright/issues/42768)）。該当する場合は、実行元のアプリのフルディスクアクセス権限を確認してください。CIではLinux上でFirefoxを含む全テストを実行します。

| コマンド                  | 対象                                               |
| ------------------------- | -------------------------------------------------- |
| `mise run test`           | VitestのNode環境とBrowser Mode                     |
| `mise run test:unit`      | Markdown変換、コンテンツ取得、入力検証             |
| `mise run test:browser`   | Chromium上で配色コンポーネント・GAの呼び出しを検証 |
| `mise run test:e2e`       | ビルド・成果物検証後、Playwrightでサイト全体を検証 |
| `mise run test:e2e:built` | ビルド済み成果物に対するE2Eテスト                  |
| `mise run test:e2e:ui`    | ビルド後、Playwright UIでテストを実行・調査        |

## 公式スキルの管理

公式スキルはnpmの開発依存に追加した `skills` CLIで管理します。

```fish
mise run skills:list
mise run skills:update
```

## CMS

https://proshunsuke.github.io/admin/ からGitHubでログインします。

1. ブログまたは固定ページを選択して編集します。
2. 保存すると下書き用ブランチとPull Requestで変更が管理されます。
3. 編集ワークフローでレビューし、公開するとmainに反映されます。
4. mainへのpushを受けてGitHub Actionsが検証・ビルド・GitHub Pagesへの公開を行います。

GitHubでPull Requestを直接レビュー・マージする運用も可能です。公開リポジトリのため、下書き本文や編集履歴も公開されます。CMSのプレビューはMarkdownの確認用で、実際のサイトレイアウトや公開前の専用URLを提供するものではありません。

認証はCloudflare WorkerでGitHub OAuthを仲介します。構成と手順は [workers/cms-auth/README.md](workers/cms-auth/README.md) に記載しています。
