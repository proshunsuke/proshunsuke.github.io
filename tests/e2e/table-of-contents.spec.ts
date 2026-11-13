import { expect, test } from "#tests/e2e/fixtures";

for (const width of [375, 1440]) {
  test(`${width}pxで目次が本文の見出しに対応し、追従ヘッダーに隠れず移動できる`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const toc = page.getByRole("navigation", { name: "目次", exact: true });
    for (const path of ["/resume/", "/posts/github-copy-title-link/"]) {
      await page.goto(path);
      const headings = await page
        .locator("article > h2, article > h3")
        .evaluateAll((elements) =>
          elements.map((element) => ({ label: element.textContent ?? "", id: element.id })),
        );
      if (headings.length === 0) {
        await expect(toc).toHaveCount(0);
        continue;
      }
      await expect(toc.getByRole("link")).toHaveText(headings.map(({ label }) => label));
      for (const [index, { id }] of headings.entries()) {
        await expect(toc.getByRole("link").nth(index)).toHaveAttribute("href", `#${id}`);
      }
      const link = toc.getByRole("link").first();
      const href = await link.getAttribute("href");
      await link.click();
      await expect.poll(() => decodeURIComponent(new URL(page.url()).hash)).toBe(href);
      await expect
        .poll(async () => {
          const header = await page.locator("body > header").boundingBox();
          const heading = await page.locator("article > h2, article > h3").first().boundingBox();
          return !!header && !!heading && heading.y >= header.y + header.height && heading.y < 900;
        })
        .toBe(true);
      await expect
        .poll(() =>
          page.locator("body > header").evaluate((element) => element.getBoundingClientRect().top),
        )
        .toBe(0);
    }
  });
}
