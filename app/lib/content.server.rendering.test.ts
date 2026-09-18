import { beforeEach, expect, test, vi } from "vitest";
import { readContent, listPosts } from "~/lib/content.server";

const files = vi.hoisted(() => ({ readFile: vi.fn(), readdir: vi.fn() }));
vi.mock("node:fs/promises", () => files);
beforeEach(() => vi.resetAllMocks());

test("Markdownのコード・表・重複見出しを変換し、目次のリンク先を一意にする", async () => {
  files.readFile.mockResolvedValue(`---
title: テスト
slug: example
---
## 見出し

\`pro_shunsuke\`

| 名前 | 値 |
| --- | --- |
| test | 1 |

## 見出し
`);
  const result = await readContent("posts", "example");
  expect(result.html).toContain("<code>pro_shunsuke</code>");
  expect(result.html).toContain("<table>");
  expect(result.headings).toEqual([
    { id: "section-見出し", label: "見出し", level: 2 },
    { id: "section-見出し-1", label: "見出し", level: 2 },
  ]);
});

test("h2・h3を本文順で抽出し、装飾と文字参照をプレーンテキストにする", async () => {
  files.readFile.mockResolvedValue(`---
title: 目次
---
# 本文タイトル
### 最初の小見出し
## **設定** &amp; \`code\`
### [手順](https://example.com/) &lt;注意&gt;
#### 詳細
##### 補足
###### 注記
> ## 引用内の見出し

## 次の章
### 手順
`);
  const { html, headings } = await readContent("pages", "example");
  expect(headings.map(({ label, level }) => ({ label, level }))).toEqual([
    { label: "最初の小見出し", level: 3 },
    { label: "設定 & code", level: 2 },
    { label: "手順 <注意>", level: 3 },
    { label: "次の章", level: 2 },
    { label: "手順", level: 3 },
  ]);
  for (const { id, level } of headings) expect(html).toContain(`<h${level} id="${id}">`);
});

test("h2・h3がない本文では目次を生成しない", async () => {
  files.readFile.mockResolvedValue("---\ntitle: 目次なし\n---\n本文\n\n#### 詳細");
  expect((await readContent("pages", "example")).headings).toEqual([]);
});

test("CMS本文に含まれるスクリプトや危険なリンクを出力しない", async () => {
  files.readFile.mockResolvedValue(`---
title: 安全な表示
---
<script>alert('unsafe')</script>

<img src=x onerror=alert(1)>

[危険](javascript:alert%281%29)

[通常](https://example.com/)
`);
  const { html } = await readContent("pages", "example");
  expect(html).not.toMatch(/<script|onerror|javascript:/i);
  expect(html).toContain('href="https://example.com/"');
});

test.each(["", "title: ''", "title: 123"])("不正なタイトルを拒否する: %s", async (frontmatter) => {
  files.readFile.mockResolvedValue(`---\n${frontmatter}\n---\n本文`);
  await expect(readContent("pages", "example")).rejects.toThrow("Missing title");
});

test("記事slugとファイル名が異なる場合は公開を止める", async () => {
  files.readFile.mockResolvedValue("---\ntitle: 記事\nslug: other\n---\n本文");
  await expect(readContent("posts", "example")).rejects.toThrow("Slug must match filename");
});

test("ファイルがない場合だけ404とし、権限エラーは隠さない", async () => {
  files.readFile.mockRejectedValueOnce(Object.assign(new Error("missing"), { code: "ENOENT" }));
  await expect(readContent("pages", "example")).rejects.toMatchObject({ status: 404 });
  const denied = Object.assign(new Error("denied"), { code: "EACCES" });
  files.readFile.mockRejectedValueOnce(denied);
  await expect(readContent("pages", "example")).rejects.toBe(denied);
});

test("不正slugではファイルにアクセスしない", async () => {
  await expect(readContent("posts", "../secret")).rejects.toMatchObject({ status: 404 });
  expect(files.readFile).not.toHaveBeenCalled();
});

test("新しいMarkdown記事を一覧に含め、他のファイルを除外する", async () => {
  files.readdir.mockResolvedValue(["z-post.md", "image.png", "a-post.md"]);
  files.readFile.mockImplementation(async (path: string) => {
    const slug = path.includes("a-post") ? "a-post" : "z-post";
    return `---\ntitle: ${slug}\nslug: ${slug}\n---\n本文`;
  });
  expect((await listPosts()).map(({ slug }) => slug)).toEqual(["a-post", "z-post"]);
});
