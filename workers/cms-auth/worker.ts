type Env = {
  GITHUB_OAUTH_ID: string;
  GITHUB_OAUTH_SECRET: string;
};

const SITE_ORIGIN = 'https://proshunsuke.github.io';
const WORKER_ORIGIN = 'https://proshunsuke-cms-auth.shunsuke0901.workers.dev';
const CALLBACK_URL = `${WORKER_ORIGIN}/callback`;
const COOKIE_NAME = '__Host-cms-oauth';
const MAX_AGE = 600;
const encoder = new TextEncoder();

const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const signingKey = (secret: string) =>
  crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

const createState = async (secret: string) => {
  const payload = `${hex(crypto.getRandomValues(new Uint8Array(32)))}.${Date.now()}`;
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(payload));
  return `${payload}.${hex(new Uint8Array(signature))}`;
};

const validState = async (state: string, secret: string) => {
  if (!/^[a-f0-9]{64}\.\d{13}\.[a-f0-9]{64}$/.test(state)) return false;
  const [nonce, timestamp, signature] = state.split('.');
  const age = Date.now() - Number(timestamp);
  if (age < 0 || age > MAX_AGE * 1000) return false;
  const bytes = Uint8Array.from(signature.match(/../g)!, (part) => Number.parseInt(part, 16));
  return crypto.subtle.verify('HMAC', await signingKey(secret), bytes, encoder.encode(`${nonce}.${timestamp}`));
};

const cookie = (state: string, maxAge = MAX_AGE) =>
  `${COOKIE_NAME}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

const headers = () => new Headers({
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
});

const plain = (message: string, status: number) => {
  const responseHeaders = headers();
  responseHeaders.set('Content-Type', 'text/plain; charset=utf-8');
  return new Response(message, { status, headers: responseHeaders });
};

const callbackPage = (status: 'success' | 'error', data: { token?: string; message?: string }) => {
  const nonce = hex(crypto.getRandomValues(new Uint8Array(16)));
  const responseHeaders = headers();
  responseHeaders.set('Content-Type', 'text/html; charset=utf-8');
  responseHeaders.set('Set-Cookie', cookie('', 0));
  responseHeaders.set('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`);
  const message = JSON.stringify(`authorization:github:${status}:${JSON.stringify(data)}`).replaceAll('<', '\\u003c');
  return new Response(`<!doctype html><html lang="ja"><meta charset="utf-8"><title>CMS 認証</title>
<body><p>認証結果を管理画面に返しています。画面が閉じない場合は、管理画面からログインし直してください。</p>
<script nonce="${nonce}">
  const origin = ${JSON.stringify(SITE_ORIGIN)};
  const opener = window.opener;
  if (opener) {
    const receive = (event) => {
      if (event.origin !== origin || event.source !== opener || event.data !== 'authorizing:github') return;
      window.removeEventListener('message', receive);
      opener.postMessage(${message}, origin);
    };
    window.addEventListener('message', receive);
    opener.postMessage('authorizing:github', origin);
  }
</script></body></html>`, { headers: responseHeaders });
};

const authorize = async (url: URL, env: Env) => {
  if (url.searchParams.get('provider') !== 'github' || url.searchParams.get('site_id') !== 'proshunsuke.github.io') {
    return plain('Invalid authentication request', 400);
  }
  const state = await createState(env.GITHUB_OAUTH_SECRET);
  const target = new URL('https://github.com/login/oauth/authorize');
  target.search = new URLSearchParams({
    client_id: env.GITHUB_OAUTH_ID,
    redirect_uri: CALLBACK_URL,
    scope: 'public_repo',
    state,
  }).toString();
  const responseHeaders = headers();
  responseHeaders.set('Location', target.href);
  responseHeaders.set('Set-Cookie', cookie(state));
  return new Response(null, { status: 302, headers: responseHeaders });
};

const callback = async (request: Request, url: URL, env: Env) => {
  const state = url.searchParams.get('state') ?? '';
  const storedState = request.headers.get('Cookie')?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!state || state !== storedState || !(await validState(state, env.GITHUB_OAUTH_SECRET))) {
    return callbackPage('error', { message: 'ログインの確認に失敗しました。管理画面からログインし直してください。' });
  }
  const code = url.searchParams.get('code');
  if (url.searchParams.has('error') || !code) {
    return callbackPage('error', { message: 'GitHub の認証が完了しませんでした。' });
  }
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code,
      redirect_uri: CALLBACK_URL,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const token: { access_token?: string; error?: string } = await tokenResponse.json();
  if (!tokenResponse.ok || token.error || !token.access_token) {
    return callbackPage('error', { message: 'GitHub の認証情報を取得できませんでした。' });
  }
  const userResponse = await fetch('https://api.github.com/user', {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token.access_token}`, 'User-Agent': 'proshunsuke-cms-auth' },
    signal: AbortSignal.timeout(10000),
  });
  const user: { login?: string } = await userResponse.json();
  if (!userResponse.ok || user.login?.toLowerCase() !== 'proshunsuke') {
    return callbackPage('error', { message: 'この管理画面を利用できるアカウントではありません。' });
  }
  // Decap's GitHub backend receives only the access token. Expiry requires a fresh login.
  return callbackPage('success', { token: token.access_token });
};

export default {
  fetch: async (request: Request, env: Env) => {
    const url = new URL(request.url);
    if (url.origin !== WORKER_ORIGIN) return plain('Not found', 404);
    if (request.method !== 'GET') return plain('Method not allowed', 405);
    if (url.pathname === '/') return plain('CMS OAuth service', 200);
    if (url.pathname !== '/auth' && url.pathname !== '/callback') return plain('Not found', 404);
    if (!env.GITHUB_OAUTH_ID || !env.GITHUB_OAUTH_SECRET) return plain('Authentication is not configured', 503);
    try {
      return url.pathname === '/auth' ? await authorize(url, env) : await callback(request, url, env);
    } catch {
      return callbackPage('error', { message: '認証サービスとの通信に失敗しました。もう一度ログインしてください。' });
    }
  },
};
