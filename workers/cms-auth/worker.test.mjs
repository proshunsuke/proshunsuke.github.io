import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import worker from "./worker.ts";

const origin = "https://proshunsuke-cms-auth.shunsuke0901.workers.dev";
const env = { GITHUB_OAUTH_ID: "test-id", GITHUB_OAUTH_SECRET: "test-secret" };
const begin = async () => {
  const response = await worker.fetch(
    new Request(`${origin}/auth?provider=github&site_id=proshunsuke.github.io&scope=repo`),
    env,
  );
  const location = new URL(response.headers.get("Location"));
  return {
    response,
    location,
    state: location.searchParams.get("state"),
    cookie: response.headers.get("Set-Cookie").split(";")[0],
  };
};
const finish = (state, cookie, suffix = "&code=test-code") =>
  worker.fetch(
    new Request(`${origin}/callback?state=${state}${suffix}`, { headers: { Cookie: cookie } }),
    env,
  );

test("authorization binds state to a secure cookie and fixes scope and redirect", async () => {
  const { response, location, state } = await begin();
  assert.equal(response.status, 302);
  assert.equal(location.origin, "https://github.com");
  assert.equal(location.searchParams.get("scope"), "public_repo");
  assert.equal(location.searchParams.get("redirect_uri"), `${origin}/callback`);
  assert.match(state, /^[a-f0-9]{64}\.\d{13}\.[a-f0-9]{64}$/);
  assert.match(response.headers.get("Set-Cookie"), /HttpOnly; Secure; SameSite=Lax; Max-Age=600/);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("rejects unknown provider, site, origin, method, and missing configuration", async () => {
  for (const query of [
    "provider=gitlab&site_id=proshunsuke.github.io",
    "provider=github&site_id=evil.example",
    "provider=github",
  ]) {
    assert.equal((await worker.fetch(new Request(`${origin}/auth?${query}`), env)).status, 400);
  }
  assert.equal((await worker.fetch(new Request("https://evil.example/auth"), env)).status, 404);
  assert.equal(
    (await worker.fetch(new Request(`${origin}/auth`, { method: "POST" }), env)).status,
    405,
  );
  assert.equal((await worker.fetch(new Request(`${origin}/auth`), {})).status, 503);
});

test("missing, mismatched, and forged state never exchanges a code", async (t) => {
  const mocked = t.mock.method(globalThis, "fetch", () => {
    throw new Error("must not call GitHub");
  });
  const { state, cookie } = await begin();
  const forged = `f${state.slice(1)}` === state ? `e${state.slice(1)}` : `f${state.slice(1)}`;
  for (const [value, saved] of [
    [state, ""],
    ["invalid", cookie],
    [forged, `__Host-cms-oauth=${forged}`],
  ]) {
    assert.match(await (await finish(value, saved)).text(), /authorization:github:error:/);
  }
  assert.equal(mocked.mock.callCount(), 0);
});

test("expired signed state is rejected before contacting GitHub", async (t) => {
  const now = Date.now();
  const clock = t.mock.method(Date, "now", () => now - 601000);
  const { state, cookie } = await begin();
  clock.mock.restore();
  assert.match(await (await finish(state, cookie)).text(), /authorization:github:error:/);
});

test("successful callback accepts messages only from the CMS opener", async (t) => {
  const { state, cookie } = await begin();
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return Response.json(
      url.includes("access_token")
        ? { access_token: "test-token", refresh_token: "never-expose-refresh" }
        : { login: "proshunsuke" },
    );
  });
  const response = await finish(state, cookie);
  const html = await response.text();
  assert.equal(calls.length, 2);
  assert.equal(calls[0].options.body.get("client_secret"), env.GITHUB_OAUTH_SECRET);
  assert.equal(calls[1].options.headers.Authorization, "Bearer test-token");
  assert.match(response.headers.get("Set-Cookie"), /Max-Age=0/);
  assert.match(response.headers.get("Content-Security-Policy"), /default-src 'none'/);
  assert.ok(!html.includes(env.GITHUB_OAUTH_SECRET));
  assert.ok(!html.includes("never-expose-refresh"));
  let listener;
  const sent = [];
  const opener = { postMessage: (...args) => sent.push(args) };
  const window = {
    opener,
    addEventListener: (_, fn) => {
      listener = fn;
    },
    removeEventListener: () => {},
  };
  runInNewContext(html.match(/<script nonce="[^"]+">([\s\S]*?)<\/script>/)[1], { window });
  assert.deepEqual(sent, [["authorizing:github", "https://proshunsuke.github.io"]]);
  listener({ origin: "https://evil.example", source: opener, data: "authorizing:github" });
  listener({ origin: "https://proshunsuke.github.io", source: {}, data: "authorizing:github" });
  assert.equal(sent.length, 1);
  listener({ origin: "https://proshunsuke.github.io", source: opener, data: "authorizing:github" });
  assert.equal(sent[1][0], 'authorization:github:success:{"token":"test-token"}');
  assert.equal(sent[1][1], "https://proshunsuke.github.io");
});

test("denied authorization, wrong user, and upstream failures never expose a token", async (t) => {
  const { state, cookie } = await begin();
  assert.match(
    await (await finish(state, cookie, "&error=access_denied")).text(),
    /authorization:github:error:/,
  );
  const mock = t.mock.method(globalThis, "fetch", async (url) =>
    Response.json(
      url.includes("access_token")
        ? { access_token: "private-test-token" }
        : { login: "someone-else" },
    ),
  );
  const html = await (await finish(state, cookie)).text();
  assert.match(html, /authorization:github:error:/);
  assert.ok(!html.includes("private-test-token"));
  mock.mock.mockImplementation(async () => {
    throw new Error("upstream-private-details");
  });
  const failed = await (await finish(state, cookie)).text();
  assert.match(failed, /authorization:github:error:/);
  assert.ok(!failed.includes("upstream-private-details"));
});

test("diagnostic logs classify failures without exposing OAuth data", async (t) => {
  const logged = [];
  t.mock.method(console, "error", (line) => logged.push(JSON.parse(line)));
  const upstream = t.mock.method(globalThis, "fetch");
  const { state, cookie } = await begin();
  const scenarios = [
    {
      response: () => new Response("private-response", { status: 503 }),
      stage: "token_exchange",
      reason: "upstream_http",
      status: 503,
    },
    {
      response: () => new Response("private-response"),
      stage: "token_exchange",
      reason: "invalid_response",
      status: 200,
    },
    {
      response: () => Response.json({ access_token: 123 }),
      stage: "token_exchange",
      reason: "invalid_response",
    },
    {
      response: () => {
        throw new DOMException("private-timeout", "TimeoutError");
      },
      stage: "token_exchange",
      reason: "timeout",
    },
    {
      response: () => {
        throw new Error("private-network");
      },
      stage: "token_exchange",
      reason: "network",
    },
    {
      response: (url) =>
        Response.json(
          url.includes("access_token") ? { access_token: "private-token" } : { login: 123 },
        ),
      stage: "user_lookup",
      reason: "invalid_response",
    },
  ];
  for (const { response, stage, reason, status } of scenarios) {
    logged.length = 0;
    upstream.mock.mockImplementation(async (url) => response(url));
    const html = await (await finish(state, cookie)).text();
    assert.match(html, /authorization:github:error:/);
    assert.deepEqual(logged, [
      { event: "cms_oauth_failure", stage, reason, ...(status === undefined ? {} : { status }) },
    ]);
    for (const secret of [
      state,
      cookie,
      "test-code",
      env.GITHUB_OAUTH_SECRET,
      "private-response",
      "private-token",
      "private-timeout",
      "private-network",
    ]) {
      assert.ok(!JSON.stringify(logged).includes(secret));
      assert.ok(!html.includes(secret));
    }
  }
});
