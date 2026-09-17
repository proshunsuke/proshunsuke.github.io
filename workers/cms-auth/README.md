# Decap CMS の GitHub 認証

Cloudflare Workers Free 上で動かす、サイト専用の OAuth 仲介処理です。

- Worker: `proshunsuke-cms-auth`
- URL: https://proshunsuke-cms-auth.shunsuke0901.workers.dev
- OAuth callback: `/callback`
- Secret: `GITHUB_OAUTH_ID`, `GITHUB_OAUTH_SECRET`（Cloudflare 側で設定）
- 利用者: GitHub の `proshunsuke`
- トークン送信先: `https://proshunsuke.github.io` のみ
- scope: `public_repo`。OAuth の性質上、この scope は対象リポジトリ1つに限定されません。

ログインは署名付き state と Secure / HttpOnly / SameSite=Lax Cookie で10分間だけ有効にします。
認証結果は Decap の postMessage ハンドシェイクで返し、送信元 origin と opener を検証します。
GitHub のアクセストークン有効期限は維持します。refresh token は配布せず、期限切れ後は再ログインします。
本文の取得・更新は Decap が GitHub API を直接呼び出します。

Decap 側の接続設定（`public/admin/config.yml`）:

```yaml
backend:
  name: github
  repo: proshunsuke/proshunsuke.github.io
  branch: main
  base_url: https://proshunsuke-cms-auth.shunsuke0901.workers.dev
  auth_endpoint: auth
  site_domain: proshunsuke.github.io
```

開発コマンド（このディレクトリで実行）:

```fish
npm ci
npm test
npm run typecheck
npm run build
```

`dist/worker.js` はWranglerで配置する依存ライブラリなしのES moduleです。
リポジトリルートから `mise run auth:check` でも検証できます。
認証 URL のクエリに一時コードが含まれるため、起動ログを無効にしています。
Workers Logs 自体は有効です。コードから認証情報をログ出力しないでください。
ダッシュボードと Wrangler の両方で `invocation_logs: false` を設定済みです。

2026-09-16: コードをダッシュボードから配置済み（バージョン `655232d9`）。
ローカルの6テスト・型チェック・ビルドは成功しています。
Brave で公開 URL の応答と GitHub の認可画面への遷移を確認済みです。
ユーザー承認のうえ `public_repo` 権限を付与し、実際の GitHub 認可・トークン交換・
アカウント照合が成功したことを確認済みです（トークン値は出力していません）。
公開済みCMSからGitHubログインし、認証ポップアップが閉じて記事一覧・編集画面が表示されることを確認済みです。
期限切れ後の再ログインは未検証です。

参考: [Decap の OAuth 仕様](https://decapcms.org/docs/backends-overview/)、
[公式資料掲載のサンプル](https://github.com/sterlingwes/decap-proxy/tree/9adde7c898ed4675f414f50334c321d6c87751ed)。
サンプルの API とハンドシェイクを参照し、サイト固有の制限と state 検証を実装しています。

## 自動デプロイ

`.github/workflows/main.yml` の `deploy-worker` ジョブで、mainへのpush時に自動デプロイします。PRでは検証のみ行います。手動実行もmainを選択した場合だけデプロイします。

サイトとWorkerの検証に成功した後、固定バージョンのWranglerで `dist/worker.js` を配置します。デプロイするコードは実行対象コミットから生成します。ワークフローの同時実行を制限し、配置直前にmainの先頭コミットと一致することを確認するため、古い実行の再実行で本番を巻き戻しません。WorkerのバージョンにはコミットSHAをタグとして記録します。

初回はGitHubリポジトリのActions Secretsに以下を登録してください。

- `CLOUDFLARE_ACCOUNT_ID`: 既存Workerを所有するCloudflareアカウントID
- `CLOUDFLARE_API_TOKEN`: 対象アカウントのWorkerを更新できるデプロイ専用トークン

OAuth用の `GITHUB_OAUTH_ID` と `GITHUB_OAUTH_SECRET` はCloudflareのWorker Secretsに保持します。通常のWranglerデプロイでは既存のSecretは削除されません。APIトークンやOAuth Secretをコードへ記載しないでください。

`worker.ts` と `wrangler.jsonc` を変更・pushして更新します。ダッシュボードでのコード編集は通常の更新手順として使用しません。`mise run auth:check` は型検査・テスト・ビルドに加えてデプロイのdry-runを行い、Cloudflare本番への更新は行いません。

配置後に `/` の応答と `/auth` のGitHubへのリダイレクトを自動確認します。実際のユーザーログイン・トークン交換はこの確認には含めません。デプロイや応答確認の失敗はActionsの失敗として記録されます。
