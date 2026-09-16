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

`dist/worker.js` は Cloudflare ダッシュボードへ配置できる依存ライブラリなしの ES module です。
リポジトリルートから `mise run auth:check` でも検証できます。
認証 URL のクエリに一時コードが含まれるため、起動ログを無効にしています。
Workers Logs 自体は有効です。コードから認証情報をログ出力しないでください。
ダッシュボードと Wrangler の両方で `invocation_logs: false` を設定済みです。

2026-09-16: コードをダッシュボードから配置済み（バージョン `655232d9`）。
ローカルの6テスト・型チェック・ビルドは成功しています。
Brave で公開 URL の応答と GitHub の認可画面への遷移を確認済みです。
ユーザー承認のうえ `public_repo` 権限を付与し、実際の GitHub 認可・トークン交換・
アカウント照合が成功したことを確認済みです（トークン値は出力していません）。
CMS管理画面を実装済みです。実画面へのトークン受け渡しは公開後に確認します。期限切れ後の再ログインは未検証です。
認証成功後、ルート URL へ戻る操作では Brave の `ERR_BLOCKED_BY_CLIENT` が再発しています。
CMS 接続の検証時にはブラウザのブロック状況も確認してください。

参考: [Decap の OAuth 仕様](https://decapcms.org/docs/backends-overview/)、
[公式資料掲載のサンプル](https://github.com/sterlingwes/decap-proxy/tree/9adde7c898ed4675f414f50334c321d6c87751ed)。
サンプルの API とハンドシェイクを参照し、サイト固有の制限と state 検証を実装しています。
