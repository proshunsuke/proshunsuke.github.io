import { expect, test } from "vitest";
import { readContent, listPosts } from "~/lib/content.server";

test("公開対象の記事と固定ページを読み込める", async () => {
  const posts = await listPosts();
  expect(posts).toEqual(
    expect.arrayContaining([expect.objectContaining({ slug: "github-copy-title-link" })]),
  );
  expect(posts.some(({ slug }) => /^test-post-[123]$/.test(slug))).toBe(false);
  for (const slug of ["resume", "about"]) {
    const page = await readContent("pages", slug);
    expect(page.headings.length).toBeGreaterThanOrEqual(3);
    expect(page.html).toContain('<h2 id="section-');
    expect(page.html).not.toContain("<Career");
  }
});

test.each(["../pages/resume", "test-post-1", "test-post-2", "test-post-3", "missing-post"])(
  "存在しない・不正なslug %s は404になる",
  async (slug) => {
    await expect(readContent("posts", slug)).rejects.toMatchObject({ status: 404 });
  },
);
