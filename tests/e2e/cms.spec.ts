import { createHash } from "node:crypto";
import matter from "gray-matter";
import type { Page } from "@playwright/test";
import { expect, test } from "#tests/e2e/fixtures";

const mockGitHub = async (page: Page) => {
  const repo = "/repos/proshunsuke/proshunsuke.github.io";
  const branch = "cms/posts/kari";
  const body = "## 本文\n\n記事の本文です。\n";
  const blobs = new Map<string, string>();
  const blob = (content: string) => {
    const sha = createHash("sha1").update(content).digest("hex");
    blobs.set(sha, content);
    return sha;
  };
  const main = new Map([["content/posts/unrelated.md", blob("別の記事")]]);
  const draft = new Map(main);
  draft.set(
    "content/posts/kari.md",
    blob(matter.stringify(body, { title: "E2Eの記事", description: "記事の説明", slug: "kari" })),
  );
  const trees = new Map([
    ["main-head", main],
    ["draft-head", draft],
  ]);
  const heads = new Map([
    ["main", "main-head"],
    [branch, "draft-head"],
  ]);
  const uploads: string[] = [];
  const updates: string[] = [];
  const unexpected: string[] = [];
  const user = { login: "proshunsuke", name: "E2E User", avatar_url: "" };
  const pullRequest = () => ({
    number: 6,
    state: "open",
    title: "記事の下書き",
    user,
    labels: [{ name: "decap-cms/pending_publish" }],
    updated_at: "2026-10-06T00:00:00Z",
    head: { ref: branch, sha: heads.get(branch), repo: { fork: false } },
    base: { ref: "main" },
  });

  await page.addInitScript(() => {
    localStorage.setItem(
      "decap-cms-user",
      JSON.stringify({ backendName: "github-slug", token: "e2e-only-token", login: "proshunsuke" }),
    );
  });
  await page.route("https://github.com/**", (route) => route.abort());
  await page.route("https://proshunsuke-cms-auth.shunsuke0901.workers.dev/**", (route) =>
    route.abort(),
  );
  await page.route("https://api.github.com/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = decodeURIComponent(url.pathname);
    const method = request.method();
    const send = (json: unknown, status = 200) => route.fulfill({ json, status });
    if (method === "GET") {
      if (path === "/user" || path === "/users/proshunsuke") return send(user);
      if (path === repo)
        return send({
          owner: { login: "proshunsuke" },
          permissions: { push: true },
          default_branch: "main",
        });
      if (path === `${repo}/pulls`) return send([pullRequest()]);
      if (path === `${repo}/pulls/6`) return send(pullRequest());
      if (path === `${repo}/issues` || path === `${repo}/issues/6/comments`) return send([]);
      if (path === `${repo}/commits`)
        return send([{ commit: { author: { name: user.name, date: "2026-10-06T00:00:00Z" } } }]);
      if (path.endsWith("/status")) return send({ statuses: [] });
      if (path.startsWith(`${repo}/branches/`)) {
        const name = path.slice(`${repo}/branches/`.length);
        return send({ name, commit: { sha: heads.get(name) } });
      }
      if (path.startsWith(`${repo}/git/trees/`)) {
        const [ref, folder = ""] = path.slice(`${repo}/git/trees/`.length).split(":");
        const tree = trees.get(heads.get(ref) ?? ref);
        if (!tree) return send({ message: "Not Found" }, 404);
        const prefix = folder ? `${folder}/` : "";
        return send({
          tree: [...tree]
            .filter(([name]) => name.startsWith(prefix))
            .map(([name, sha]) => ({
              path: name.slice(prefix.length),
              sha,
              type: "blob",
              mode: "100644",
              size: blobs.get(sha)?.length,
            })),
        });
      }
      if (path.startsWith(`${repo}/git/blobs/`)) {
        const sha = path.slice(`${repo}/git/blobs/`.length);
        const content = blobs.get(sha);
        return content === undefined
          ? send({ message: "Not Found" }, 404)
          : send({ sha, encoding: "base64", content: Buffer.from(content).toString("base64") });
      }
      if (path.startsWith(`${repo}/compare/`)) {
        const to = path
          .slice(`${repo}/compare/`.length)
          .split("...")[1]
          .replace(/^proshunsuke:/, "");
        const sha = heads.get(to) ?? to;
        const tree = trees.get(sha);
        if (!tree) return send({ message: "Not Found" }, 404);
        const files = [...new Set([...main.keys(), ...tree.keys()])]
          .filter((name) => main.get(name) !== tree.get(name))
          .map((filename) => ({
            filename,
            sha: tree.get(filename) ?? "",
            status: tree.has(filename) ? "added" : "removed",
            patch: "text diff",
          }));
        return send({
          files,
          base_commit: { sha: "main-head" },
          commits: [{ sha, parents: [{ sha: "main-head" }] }],
        });
      }
    }
    if (method === "POST" && path === `${repo}/git/blobs`) {
      const data = request.postDataJSON() as { content: string; encoding: string };
      expect(data.encoding).toBe("base64");
      const content = Buffer.from(data.content, "base64").toString("utf8");
      uploads.push(content);
      return send({ sha: blob(content) }, 201);
    }
    if (method === "POST" && path === `${repo}/git/trees`) {
      const data = request.postDataJSON() as {
        base_tree: string;
        tree: { path: string; sha: string | null }[];
      };
      const tree = new Map(trees.get(data.base_tree));
      for (const file of data.tree) {
        if (file.sha === null) tree.delete(file.path);
        else tree.set(file.path, file.sha);
      }
      const sha = `tree-${trees.size}`;
      trees.set(sha, tree);
      return send({ sha }, 201);
    }
    if (method === "POST" && path === `${repo}/git/commits`) {
      const data = request.postDataJSON() as { tree: string };
      const sha = `commit-${trees.size}`;
      trees.set(sha, new Map(trees.get(data.tree)));
      return send({ sha }, 201);
    }
    if (method === "PATCH" && path.startsWith(`${repo}/git/refs/heads/`)) {
      const name = path.slice(`${repo}/git/refs/heads/`.length);
      const data = request.postDataJSON() as { sha: string };
      expect(name).toBe(branch);
      heads.set(name, data.sha);
      updates.push(name);
      return send({ ref: `refs/heads/${name}`, object: { sha: data.sha } });
    }
    unexpected.push(`${method} ${path}`);
    return send({ message: "Unexpected mocked GitHub request" }, 404);
  });
  const files = () => trees.get(heads.get(branch)!)!;
  const article = (slug: string) => matter(blobs.get(files().get(`content/posts/${slug}.md`)!)!);
  return { uploads, updates, unexpected, files, article, body };
};

test("CMSの画面からslugを変更し、正しいMarkdownを保存・再読み込み・再保存できる", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const github = await mockGitHub(page);
  await page.goto("/admin/#/collections/posts/entries/kari");
  await expect(page.getByLabel("タイトル", { exact: true })).toHaveValue("E2Eの記事");
  await page.getByLabel("URLの識別子", { exact: true }).fill("portal-site-rebuild");
  await page.getByLabel("共有・検索用の説明", { exact: true }).fill("変更した説明");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect.poll(() => github.updates.length).toBe(1);
  const saved = github.article("portal-site-rebuild");
  expect(saved.data).toEqual({
    title: "E2Eの記事",
    description: "変更した説明",
    slug: "portal-site-rebuild",
  });
  expect(saved.content.trim()).toBe(github.body.trim());
  expect([...github.files().keys()]).toEqual([
    "content/posts/unrelated.md",
    "content/posts/portal-site-rebuild.md",
  ]);
  expect(matter(github.uploads[0]).data).toEqual(saved.data);

  await page.reload();
  await expect(page).toHaveURL(/\/entries\/kari$/);
  await expect(page.getByLabel("URLの識別子", { exact: true })).toHaveValue("portal-site-rebuild");
  await expect(page.getByLabel("共有・検索用の説明", { exact: true })).toHaveValue("変更した説明");
  await page.getByLabel("タイトル", { exact: true }).fill("再保存した記事");
  await page.getByRole("button", { name: "保存", exact: true }).click();
  await expect.poll(() => github.updates.length).toBe(2);
  const resaved = github.article("portal-site-rebuild");
  expect(resaved.data).toEqual({
    title: "再保存した記事",
    description: "変更した説明",
    slug: "portal-site-rebuild",
  });
  expect(resaved.content.trim()).toBe(github.body.trim());
  expect(github.files().has("content/posts/kari.md")).toBe(false);
  expect(github.files().has("content/posts/unrelated.md")).toBe(true);
  expect(github.unexpected).toEqual([]);
});
