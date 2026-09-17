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

コンポーネントは `vitest-browser-react` とPlaywright providerで実ブラウザ上に描画します。JSDOM・React Testing Libraryは使用しません。

Vitestのテストは対象の実装ファイルの隣に配置します。Node環境は `*.test.ts`、Browser Modeは `*.browser.test.ts` または `*.browser.test.tsx` とし、Node環境からBrowser Modeのファイルを除外します。例えば `theme.tsx` に対して `theme.browser.test.tsx`、`content.server.ts` に対して `content.server.test.ts` を置きます。複数画面を横断するPlaywrightのE2Eは `tests/e2e/` にまとめます。

現在、ルート全体はE2Eで検証しています。今後ルート固有の処理をVitestで検証する場合も実装の隣に配置し、`app/routes/` に置くテストをファイルルーティングから除外する設定を併せて追加します。

E2Eは `build/client/` を専用ポート4175で配信します。未知のURLはSPAのトップページにフォールバックせず、静的な `404.html` をHTTP 404で返します。テスト用サーバーはPlaywrightが起動・終了し、開発サーバーとは別に動作します。Chromiumで一通りの検証を行い、Firefox・WebKitでは主要ページ・画面遷移・配色を確認します。画面幅375・768・1440px、ライト・ダーク配色のアクセシビリティも検証します。

CMS本文は書き換えず、変換の異常系にはモックのMarkdownを使います。GAスクリプトは差し替え、実際の計測送信を防ぎます。CMSは管理画面の入口と設定ファイルの配信までを検証し、本物のGitHubへのログイン・記事公開は行いません。

CIは1つのワークフロー内で、静的チェック、Vitest、Worker検証、サイトビルドを独立したジョブとして並列実行します。Playwright E2Eはサイトビルドの成功後に別ジョブで実行し、ダウンロードしたビルド成果物を検証します。サイトは再ビルドせず、E2Eで検証した成果物をそのままGitHub Pagesへ渡します。サイト・Workerのデプロイは、すべての検証が成功した場合だけ実行します。

CIのVitestジョブは通常のランナーで実行し、`playwright install --with-deps --only-shell chromium` でChromiumのヘッドレス実行に必要なブラウザとOS依存ライブラリだけを導入します。準備ジョブやサイトビルドの完了は待ちません。

E2Eジョブは、ブラウザとOS依存ライブラリが入ったPlaywright公式Dockerイメージで実行し、毎回のブラウザ・OS依存ライブラリのインストールを省きます。イメージのバージョンは準備ジョブで `package-lock.json` から取得するため、npm側のPlaywrightと一致します。コンテナは一般ユーザー（UID 1001）で実行し、Node.jsはコンテナ内でもmiseで管理します。

Vitest失敗時の添付ファイルと、E2E失敗時のHTMLレポート・スクリーンショット・トレースは、それぞれActionsの成果物として7日間保持します。ローカルでは `mise exec -- npx playwright show-report` でレポートを確認できます。

## 公式スキルの管理

公式スキルはnpmの開発依存に追加した `skills` CLIで管理します。ファイルは `.agents/skills/`、取得元・参照先・ハッシュはCLIが生成する `skills-lock.json` に保存し、両方をGit管理します。CLI本体のバージョンは `package-lock.json` で管理します。

| スキル                   | 公式の取得元                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------ |
| `react-router`           | `remix-run/react-router` の `.agents/skills/react-router`                            |
| `workers-best-practices` | `cloudflare/skills` の `skills/workers-best-practices`                               |
| `wrangler`               | `cloudflare/skills` の `skills/wrangler`                                             |
| `playwright-cli`         | `microsoft/playwright` の `packages/playwright-core/src/tools/skills/playwright-cli` |

```fish
mise run skills:list
mise run skills:update
```

更新タスクは、このプロジェクトのスキルだけを取得元の最新版へ更新します。更新後はスキル本文と `skills-lock.json` の差分を確認してコミットします。`npm ci` やCIではスキルを自動更新せず、リポジトリに保存された内容を使用します。

skills CLI 1.6.0の `update` はPlaywrightリポジトリ内の深い階層にあるスキルを発見できず、更新をスキップします。そのため更新タスクでは、他の3スキルに `skills update` を使い、Playwrightには保存先URLを明示した `skills add` を再実行します。どちらもskills CLIがファイルとロック情報を管理します。スキル追加時は更新タスクの対象も見直してください。

スキルを追加する場合は公式の取得元を確認し、`mise exec -- npx --no-install skills add <取得元> --agent codex --skill <スキル名>` を使います。ライセンス原文は更新で上書きされない `.agents/licenses/` に保存しています。Vitestは公式スキルが未提供のため、公式ドキュメントに従います。

## lint・formatter

OxlintとOxfmtを使用します。Oxlintは標準のプラグインとルール分類を維持し、React用の内蔵プラグインだけを追加しています。個別ルールの調整・無効化や型情報を使う追加lintは行っていません。標準動作ではwarningだけで終了コードは非ゼロになりません。

Oxfmtは標準の整形規則で、サイト・スクリプト・認証Worker・設定ファイル・READMEを整形します。CMSで管理する `content/**/*.md` は整形・整形チェックの対象外です。Tailwindクラス順・import順の並べ替えは有効化していません。生成物と依存パッケージはgitignore等の標準除外に従います。CIの静的チェックジョブでも同じlint・整形チェック・型検査を実行します。

OxlintはMarkdownを検査しません。CMS本文は整形規則を強制せず、必須のfrontmatterやslugなど公開に必要な内容をコンテンツ検証・ビルドで確認します。

## 本文とURL

`app/root.tsx` はHTML文書・共通スクリプト・最上位のエラー表示を担当します。公開サイトのヘッダー・パンくず・本文領域・遷移中表示は、URLに現れないレイアウトルート `app/routes/_site.tsx` にまとめています。既存ページは `_site.*.tsx` としてその配下に置き、URLは維持します。将来、異なるレイアウトのページを追加する場合は `_site` の外にルートを定義することで、公開サイトのヘッダーやパンくずを付けずに表示できます。

| URL              | 本文 / ルート                                                          |
| ---------------- | ---------------------------------------------------------------------- |
| `/`              | `app/routes/_site._index.tsx`                                          |
| `/resume/`       | `content/pages/resume.md`                                              |
| `/about-page/`   | `content/pages/about-page.md`                                          |
| `/posts/`        | `app/routes/_site.posts._index.tsx` が記事一覧を生成                   |
| `/posts/<slug>/` | `content/posts/<slug>.md` を `app/routes/_site.posts.$slug.tsx` が表示 |

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

開発・公開ブランチは `main` です。GitHub PagesのSourceは **GitHub Actions** を使用します。`.github/workflows/main.yml` がPRの検証とmainの公開を担当し、認証WorkerもCloudflareへ自動デプロイします。初回に必要なActions Secretsは [認証WorkerのREADME](workers/cms-auth/README.md#自動デプロイ) に記載しています。日次ビルドはありません。

GitHub Pagesは動的サーバーを持たないため、既存ページのHTMLとReact Routerの遷移用データを生成します。未知のURLには専用の静的な `404.html` を配信します。存在しない記事のデータ取得を避け、JavaScriptなしでもエラー内容を表示し、HTTP 404を維持します。

GA4は既存のActions Secret `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` を継続使用し、ビルド時に `VITE_GOOGLE_ANALYTICS_ID` に渡します。測定IDは公開される識別子です。ローカルで計測する場合のみ `.env.example` を参考に `.env.local` を作成します。アプリ側でページ遷移ごとに `page_view` を送るため、GA4の拡張計測で「ブラウザの履歴イベントに基づくページの変更」を併用すると重複計測になります。該当設定を無効にしてください。

`/.well-known/nostr.json` と既存プロフィール画像・faviconは継続して公開します。配色はOS設定に追従し、手動選択した場合は端末内に保存します。
