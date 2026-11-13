import { expect, test } from "#tests/e2e/fixtures";
import AxeBuilder from "@axe-core/playwright";

for (const width of [375, 768, 1440]) {
  test(`${width}pxで主要ページが横にはみ出さない`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/resume/", "/business/", "/posts/github-copy-title-link/"]) {
      await page.goto(path);
      await expect(page.getByRole("group", { name: "配色" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`${colorScheme}配色で主要ページのアクセシビリティを検証する`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    for (const path of [
      "/",
      "/resume/",
      "/about/",
      "/business/",
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
