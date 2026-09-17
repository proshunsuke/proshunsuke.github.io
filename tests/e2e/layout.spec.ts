import { expect, test } from "#tests/e2e/fixtures";
import AxeBuilder from "@axe-core/playwright";

for (const width of [375, 768, 1440]) {
  test(`${width}pxで横にはみ出さず、追従ヘッダーが目次移動先を隠さない`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/resume/", "/posts/github-copy-title-link/"]) {
      await page.goto(path);
      await expect(page.getByRole("group", { name: "配色" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.goto("/resume/");
    const link = page.getByRole("navigation", { name: "目次" }).getByRole("link").nth(1);
    const href = await link.getAttribute("href");
    await link.click();
    const heading = page.locator(`[id="${href!.slice(1)}"]`);
    await expect
      .poll(async () => {
        const header = await page.locator("body > header").boundingBox();
        const target = await heading.boundingBox();
        return !!header && !!target && target.y >= header.y + header.height && target.y < 900;
      })
      .toBe(true);
    await expect
      .poll(() =>
        page.locator("body > header").evaluate((element) => element.getBoundingClientRect().top),
      )
      .toBe(0);
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`${colorScheme}配色で主要ページのアクセシビリティを検証する`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    for (const path of [
      "/",
      "/resume/",
      "/about-page/",
      "/posts/",
      "/posts/github-copy-title-link/",
    ]) {
      await page.goto(path);
      await expect(page.getByRole("group", { name: "配色" })).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations, `${path} (${colorScheme})`).toEqual([]);
    }
  });
}

test("キーボードで本文へスキップできる", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "本文へ移動" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});
