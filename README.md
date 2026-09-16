# pro_shunsuke’s page

職務経歴書とブログの個人サイト。公開先: https://proshunsuke.github.io/

React Router 8 Framework Mode / SPA（`ssr: false`）と、Tailwind CSS 4で構成しています。ルートは `app/routes/` のファイル規約で定義し、公開ページをビルド時に事前生成します。Node.jsはmise、依存パッケージはnpmで管理します。

## ローカル開発

miseをインストールした環境で、以下を実行します。

```fish
mise trust
mise install node
mise run install
mise run dev
```

- `mise run check`: 型検査、コンテンツの検証
- `mise run build`: 全ページの静的生成。成果物は `build/client/`
- `mise run preview`: ビルド済みサイトの確認
- `node scripts/verify-build.mjs`: 公開成果物の検証（ビルド後）
- `mise run auth:check`: OAuth Workerの型検査、テスト、ビルド

## 本文とURL

| URL              | 本文 / ルート                                                    |
| ---------------- | ---------------------------------------------------------------- |
| `/`              | `app/routes/_index.tsx`                                          |
| `/resume/`       | `content/pages/resume.md`                                        |
| `/about-page/`   | `content/pages/about-page.md`                                    |
| `/posts/`        | `app/routes/posts._index.tsx` が記事一覧を生成                   |
| `/posts/<slug>/` | `content/posts/<slug>.md` を `app/routes/posts.$slug.tsx` が表示 |

ブログのfrontmatterは `title` と `slug`、固定ページは `title` を持ちます。本文はMarkdownで書きます。HTMLやJSXは実行しません。記事ファイル名と `slug` は一致させ、公開後は変更しないでください。タイトルはURLを変えずに変更できます。

記事の追加時はルートファイルの追加は不要です。`content/posts/` のMarkdownから、一覧・記事ページ・遷移用データが生成されます。削除したテスト記事3件は公開されません。

職務経歴の使用期間は `2015年4月〜2024年7月`、`2019年12月〜現在` のように記載します。経験年数の自動計算は行いません。

## CMS

公開サイトの https://proshunsuke.github.io/admin/ からGitHubでログインします。

1. ブログまたは固定ページを選択して編集します。
2. 保存すると下書き用ブランチとPull Requestで変更が管理されます。
3. 編集ワークフローでレビューし、公開するとmainに反映されます。
4. mainへのpushを受けてGitHub Actionsが検証・ビルド・GitHub Pagesへの公開を行います。

GitHubでPull Requestを直接レビュー・マージする運用も可能です。公開リポジトリのため、下書き本文や編集履歴も公開されます。CMSのプレビューはMarkdownの確認用で、実際のサイトレイアウトや公開前の専用URLを提供するものではありません。

認証は無料のCloudflare WorkerでGitHub OAuthを仲介します。構成と手順は [workers/cms-auth/README.md](workers/cms-auth/README.md) に記載しています。クライアントシークレットはWorkerのSecretのみへ保存します。サイトのビルドには渡しません。

CMS本体はバージョン固定のDecap CMS 3.16.2をunpkgから読み込みます。通常ページの表示にはこのCDNもWorkerも必要ありません。

## 公開

開発・公開ブランチは `main` です。GitHub PagesのSourceは **GitHub Actions** を使用します。`.github/workflows/main.yml` がPRの検証とmainの公開を担当します。日次ビルドはありません。

GitHub Pagesは動的サーバーを持たないため、既存ページのHTMLとReact Routerの遷移用データを生成します。未知のURLにはSPAフォールバックを `404.html` として配信し、HTTP 404を維持します。

GA4は既存のActions Secret `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` を継続使用し、ビルド時に `VITE_GOOGLE_ANALYTICS_ID` に渡します。測定IDは公開される識別子です。ローカルで計測する場合のみ `.env.example` を参考に `.env.local` を作成します。アプリ側でページ遷移ごとに `page_view` を送るため、GA4の拡張計測で「ブラウザの履歴イベントに基づくページの変更」を併用すると重複計測になります。該当設定を無効にしてください。

`/.well-known/nostr.json` と既存プロフィール画像・faviconは継続して公開します。配色はOS設定に追従し、手動選択した場合は端末内に保存します。
