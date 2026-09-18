import { expect, test } from "#tests/e2e/fixtures";

test("公開ページへ直接アクセス・再読み込みできる", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const path of ["/", "/resume/", "/about/", "/posts/", "/posts/github-copy-title-link/"]) {
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("group", { name: "配色" })).toBeVisible();
    expect((await page.reload())?.status()).toBe(200);
    await expect(page.getByRole("group", { name: "配色" })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("記事への遷移と戻る・進むが動作する", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "メインナビゲーション" })
    .getByRole("link", { name: "ブログ", exact: true })
    .click();
  await expect(page).toHaveURL(/\/posts\/$/);
  await page.locator('main a[href="/posts/github-copy-title-link/"]').click();
  await expect(page.getByRole("article")).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "ブログ", exact: true })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/posts\/github-copy-title-link\/$/);
  await expect(page.getByRole("article")).toBeVisible();
});

test("配色を保存し、自動モードではOSの変更に追従する", async ({ page }) => {
  await page.goto("/");
  await page.getByTitle("ダーク", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.getByRole("radio", { name: "ダーク", exact: true })).toBeChecked();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByTitle("自動", { exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
