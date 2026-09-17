import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";

const origin = "https://proshunsuke-cms-auth.shunsuke0901.workers.dev";
const verify = async () => {
  const response = await fetch(origin, { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, "Worker must respond successfully");
  assert.equal(await response.text(), "CMS OAuth service");

  const auth = await fetch(`${origin}/auth?provider=github&site_id=proshunsuke.github.io`, {
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(auth.status, 302, "Worker must start GitHub authorization");
  const target = new URL(auth.headers.get("location"));
  assert.equal(target.origin, "https://github.com");
  assert.equal(target.pathname, "/login/oauth/authorize");
  assert.equal(target.searchParams.get("redirect_uri"), `${origin}/callback`);
  assert.ok(target.searchParams.get("client_id"), "OAuth client ID must be configured");
  assert.ok(target.searchParams.get("state"), "OAuth state must be present");
  assert.ok(auth.headers.get("set-cookie"), "OAuth state cookie must be present");
};

for (let attempt = 1; attempt <= 5; attempt++) {
  try {
    await verify();
    console.log("Worker response and GitHub authorization redirect verified.");
    break;
  } catch (error) {
    if (attempt === 5) throw error;
    console.log(`Worker verification attempt ${attempt} failed; retrying.`);
    await setTimeout(3000);
  }
}
