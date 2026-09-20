import { afterEach, expect, test } from "vitest";
import { mkdtemp, mkdir, copyFile, writeFile, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { generateImages, renderImage, validImage } from "./og-images.mjs";

const roots = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

test("新規・タイトル変更・生成環境変更だけを再生成し、キャッシュなしでも復旧できる", async () => {
  const root = await mkdtemp(join(tmpdir(), "site-og-"));
  roots.push(root);
  await mkdir(join(root, "assets/fonts"), { recursive: true });
  await mkdir(join(root, "content/posts"), { recursive: true });
  await mkdir(join(root, "public/images"), { recursive: true });
  await copyFile("public/images/icon.jpg", join(root, "public/images/icon.jpg"));
  await copyFile(
    "assets/fonts/NotoSansJP-Bold.otf",
    join(root, "assets/fonts/NotoSansJP-Bold.otf"),
  );
  await copyFile("package-lock.json", join(root, "package-lock.json"));
  const article = join(root, "content/posts/example.md");
  const update = (title, description = "説明", body = "本文") =>
    writeFile(
      article,
      `---\ntitle: ${title}\nslug: example\ndescription: ${description}\n---\n${body}`,
    );
  await update("日本語のタイトルと GitHub & <React>");
  const first = await generateImages(root);
  expect(first).toMatchObject({ generated: 5, reused: 0 });
  const url = first.manifest["/posts/example/"].url;
  const cached = join(root, ".cache/og", url.split("/").at(-1));
  const before = await stat(cached);
  expect(await generateImages(root)).toMatchObject({ generated: 0, reused: 5 });
  expect((await stat(cached)).mtimeMs).toBe(before.mtimeMs);

  await update("日本語のタイトルと GitHub & <React>", "説明を変更", "本文を変更");
  const bodyChange = await generateImages(root);
  expect(bodyChange).toMatchObject({ generated: 0, reused: 5 });
  expect(bodyChange.manifest).toEqual(first.manifest);

  await update("変更したタイトル");
  const changed = await generateImages(root);
  expect(changed).toMatchObject({ generated: 1, reused: 4 });
  expect(changed.manifest["/posts/example/"].url).not.toBe(url);
  expect(changed.manifest["/"]).toEqual(first.manifest["/"]);
  expect(await readdir(join(root, "public/og"))).not.toContain(url.split("/").at(-1));

  // A cached but damaged image must not be copied into the site.
  const current = join(
    root,
    ".cache/og",
    changed.manifest["/posts/example/"].url.split("/").at(-1),
  );
  await writeFile(current, "broken");
  expect(await generateImages(root)).toMatchObject({ generated: 1, reused: 4 });
  expect(validImage(await readFile(current))).toBe(true);

  await writeFile(join(root, "package-lock.json"), '{"lockfileVersion": 3}\n');
  expect(await generateImages(root)).toMatchObject({ generated: 5, reused: 0 });
  await rm(join(root, ".cache/og"), { recursive: true });
  expect(await generateImages(root)).toMatchObject({ generated: 5, reused: 0 });

  await rm(article);
  const removed = await generateImages(root);
  expect(removed).toMatchObject({ generated: 0, reused: 4 });
  expect(removed.manifest["/posts/example/"]).toBeUndefined();
  expect(await readdir(join(root, "public/og"))).toHaveLength(4);
}, 30000);

test("長い日本語タイトルを収め、収まらない場合は切り捨てずに失敗する", async () => {
  const font = await readFile("assets/fonts/NotoSansJP-Bold.otf");
  const icon = await readFile("public/images/icon.jpg");
  const input = {
    label: "BLOG",
    name: "pro_shunsuke",
    domain: "proshunsuke.github.io",
    icon: `data:image/jpeg;base64,${icon.toString("base64")}`,
  };
  expect(
    validImage(
      await renderImage(
        {
          ...input,
          title:
            "GitHubのPull requestとIssueのタイトルとURLをコピーしてそれをGoogle Docsに直接貼り付ける",
        },
        font,
      ),
    ),
  ).toBe(true);
  await expect(
    renderImage({ ...input, title: "長い日本語タイトル".repeat(100) }, font),
  ).rejects.toThrow("does not fit");
}, 30000);
