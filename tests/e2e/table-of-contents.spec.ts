import { expect, test } from "#tests/e2e/fixtures";

for (const width of [375, 1440]) {
  test(`${width}pxで目次がh2・h3の階層を示し、小見出しへ移動できる`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const toc = page.getByRole("navigation", { name: "目次", exact: true });
    for (const path of ["/resume/", "/posts/github-copy-title-link/"]) {
      await page.goto(path);
      const labels = await page.locator("article > h2, article > h3").allTextContents();
      await expect(toc.getByRole("link")).toHaveText(labels);
      await expect(toc.locator(":scope > ul > li")).toHaveCount(
        await page.locator("article > h2").count(),
      );
    }
    const usage = toc.getByRole("listitem").filter({
      has: page.getByRole("link", { name: "使い方", exact: true }),
    });
    await expect(usage.locator("ul").getByRole("link")).toHaveText([
      "インストール方法",
      "インストールした後",
    ]);
    const link = toc.getByRole("link", { name: "インストール方法", exact: true });
    const href = await link.getAttribute("href");
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${encodeURI(href!)}$`));
    await expect
      .poll(async () => {
        const header = await page.locator("body > header").boundingBox();
        const heading = await page
          .getByRole("heading", { name: "インストール方法", exact: true })
          .boundingBox();
        return !!header && !!heading && heading.y >= header.y + header.height && heading.y < 900;
      })
      .toBe(true);
  });
}
