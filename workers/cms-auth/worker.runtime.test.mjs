import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { Miniflare, Response, Log, LogLevel } from "miniflare";
import { unstable_readConfig } from "wrangler";

const origin = "https://proshunsuke-cms-auth.shunsuke0901.workers.dev";
const config = unstable_readConfig({ config: "wrangler.jsonc" });

test("deployed module completes OAuth and rejects invalid requests in workerd", async (t) => {
  const calls = [];
  let upstreamStatus = 200;
  let login = "proshunsuke";
  const runtime = new Miniflare({
    log: new Log(LogLevel.NONE),
    cf: false,
    workers: [
      {
        config: {
          name: config.name,
          type: "worker",
          compatibilityDate: config.compatibility_date,
          compatibilityFlags: config.compatibility_flags,
          manifest: {
            mainModule: "worker.js",
            modules: {
              "worker.js": { type: "esm", contents: await readFile("dist/worker.js", "utf8") },
            },
          },
          env: {
            GITHUB_OAUTH_ID: { type: "text", value: "test-id" },
            GITHUB_OAUTH_SECRET: { type: "text", value: "test-secret" },
          },
        },
        dev: {
          outboundService: {
            type: "fetcher",
            handler: async (request) => {
              const url = new URL(request.url);
              calls.push(url.pathname);
              if (
                url.origin === "https://github.com" &&
                url.pathname === "/login/oauth/access_token"
              ) {
                assert.equal(request.method, "POST");
                assert.equal((await request.formData()).get("client_secret"), "test-secret");
                return Response.json({ access_token: "runtime-token" }, { status: upstreamStatus });
              }
              assert.equal(url.href, "https://api.github.com/user");
              assert.equal(request.headers.get("Authorization"), "Bearer runtime-token");
              return Response.json({ login });
            },
          },
        },
      },
    ],
  });
  t.after(() => runtime.dispose());
  assert.equal(await (await runtime.dispatchFetch(origin)).text(), "CMS OAuth service");
  const begin = async () => {
    const response = await runtime.dispatchFetch(
      `${origin}/auth?provider=github&site_id=proshunsuke.github.io`,
      { redirect: "manual" },
    );
    assert.equal(response.status, 302);
    const target = new URL(response.headers.get("location"));
    assert.equal(target.searchParams.get("scope"), "public_repo");
    assert.match(response.headers.get("set-cookie"), /HttpOnly; Secure; SameSite=Lax/);
    return {
      state: target.searchParams.get("state"),
      cookie: response.headers.get("set-cookie").split(";")[0],
    };
  };
  const finish = ({ state, cookie }) =>
    runtime.dispatchFetch(`${origin}/callback?state=${state}&code=runtime-code`, {
      headers: { Cookie: cookie },
    });
  const session = await begin();
  assert.match(
    await (await finish({ ...session, cookie: "" })).text(),
    /authorization:github:error:/,
  );
  assert.equal(calls.length, 0);
  const success = await finish(session);
  assert.match(await success.text(), /authorization:github:success:/);
  assert.match(success.headers.get("set-cookie"), /Max-Age=0/);
  assert.equal(calls.length, 2);
  login = "someone-else";
  const denied = await (await finish(await begin())).text();
  assert.match(denied, /authorization:github:error:/);
  assert.ok(!denied.includes("runtime-token"));
  upstreamStatus = 503;
  const failed = await (await finish(await begin())).text();
  assert.match(failed, /authorization:github:error:/);
  assert.ok(!failed.includes("runtime-token"));
});
