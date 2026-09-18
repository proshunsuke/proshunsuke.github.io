# pro_shunsuke.

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

- `mise run check`: lint、整形チェック、型検査、Vitest（Node・Browser Mode）
- `mise run lint`: Oxlintによる検査
- `mise run format`: Oxfmtによる整形
- `mise run format:check`: ファイルを書き換えずに整形を検査
- `mise run build`: 全ページの静的生成。成果物は `build/client/`
- `mise run preview`: ビルド済みサイトの確認
- `node scripts/verify-build.mjs`: 公開成果物の検証（ビルド後）
- `mise run auth:check`: OAuth Workerの型検査、テスト、ビルド

## テスト

初回とPlaywright更新後に `mise run test:install` でテスト用ブラウザをインストールします。

| コマンド                | 対象                                               |
| ----------------------- | -------------------------------------------------- |
| `mise run test`         | VitestのNode環境とBrowser Mode                     |
| `mise run test:unit`    | Markdown変換、コンテンツ取得、入力検証             |
| `mise run test:browser` | Chromium上で配色コンポーネント・GAの呼び出しを検証 |
| `mise run test:e2e`     | ビルド・成果物検証後、Playwrightでサイト全体を検証 |
| `mise run test:e2e:ui`  | ビルド後、Playwright UIでテストを実行・調査        |

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
