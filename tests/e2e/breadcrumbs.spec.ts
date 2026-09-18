import { expect, test } from "#tests/e2e/fixtures";

test("各ページにパンくずを一つ表示し、現在ページはリンクにしない", async ({ page }) => {
  for (const [path, parents] of [
    ["/", []],
    ["/resume/", ["ホーム"]],
    ["/about/", ["ホーム"]],
    ["/posts/", ["ホーム"]],
    ["/posts/github-copy-title-link/", ["ホーム", "ブログ"]],
    ["/missing-page/", ["ホーム"]],
  ] as const) {
    await page.goto(path);
    const breadcrumb = page.getByRole("navigation", { name: "パンくず", exact: true });
    await expect(breadcrumb).toHaveCount(1);
    await expect(breadcrumb.getByRole("listitem")).toHaveCount(parents.length + 1);
    await expect(breadcrumb.getByRole("link")).toHaveText([...parents]);
    const current = breadcrumb.locator('[aria-current="page"]');
    const title =
      path === "/" ? "ホーム" : await page.getByRole("heading", { level: 1 }).innerText();
    await expect(current).toHaveText(title);
    expect(await current.evaluate((element) => element.tagName)).toBe("SPAN");
  }
});

test("パンくずからブログ一覧とホームへ戻ると現在ページが更新される", async ({ page }) => {
  await page.goto("/posts/github-copy-title-link/");
  const breadcrumb = page.getByRole("navigation", { name: "パンくず", exact: true });
  await breadcrumb.getByRole("link", { name: "ブログ", exact: true }).click();
  await expect(page).toHaveURL("/posts/");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText("ブログ");
  await breadcrumb.getByRole("link", { name: "ホーム", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText("ホーム");
  await expect(breadcrumb.getByRole("link")).toHaveCount(0);
});
