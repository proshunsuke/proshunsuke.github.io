import { expect, test } from "#tests/e2e/fixtures";

test("ページ遷移で共有メタタグを更新し、OGP画像を取得できる", async ({ page, request }) => {
  await page.goto("/");
  const image = page.locator('head meta[property="og:image"]');
  const title = page.locator('head meta[property="og:title"]');
  const type = page.locator('head meta[property="og:type"]');
  await expect(title).toHaveAttribute("content", "pro_shunsuke");
  await expect(type).toHaveAttribute("content", "website");
  const homeImage = await image.getAttribute("content");
  await page.locator('main a[href="/posts/"]').click();
  await expect(title).toHaveAttribute("content", "ブログ | pro_shunsuke");
  const postLink = page.locator('main a[href="/posts/github-copy-title-link/"]');
  const postTitle = await postLink.locator("h2").innerText();
  await postLink.click();
  await expect(title).toHaveAttribute("content", `${postTitle} | pro_shunsuke`);
  await expect(type).toHaveAttribute("content", "article");
  await expect(image).toHaveCount(1);
  const imageUrl = await image.getAttribute("content");
  expect(imageUrl).not.toBe(homeImage);
  await expect(page.locator('head meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    imageUrl!,
  );
  await expect(page.locator('head meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  const response = await request.get(new URL(imageUrl!).pathname);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
  await page.goBack();
  await expect(type).toHaveAttribute("content", "website");
  await expect(title).toHaveAttribute("content", "ブログ | pro_shunsuke");
});

test("サイト紹介のURL・タイトル・リンクを統一する", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /このサイトについて/ }),
  ).toHaveAttribute("href", "/about/");
  await page
    .getByRole("main")
    .getByRole("link", { name: /このサイトについて/ })
    .click();
  await expect(page).toHaveURL("/about/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("このサイトについて");
  await expect(page).toHaveTitle("このサイトについて | pro_shunsuke");
});

test("GitHub・X・mixi2はトップページから新規タブで開く", async ({ page }) => {
  await page.goto("/");
  for (const [name, href] of [
    ["GitHub", "https://github.com/proshunsuke"],
    ["X", "https://x.com/pro_shunsuke"],
    ["mixi2", "https://mixi.social/@pro_shunsuke"],
  ]) {
    const link = page.getByRole("link", { name: new RegExp(`^${name} `) });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAttribute("rel", /noreferrer/);
  }
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
});

test("管理画面のリンク先とCMS設定が配信される", async ({ page, request }) => {
  // CMS itself is third-party; verify our entry point without GitHub login/writes.
  await page.route("https://unpkg.com/**", (route) =>
    route.fulfill({ contentType: "text/javascript", body: "" }),
  );
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("link")).toHaveCount(1);
  await expect(page.getByRole("banner").getByRole("link")).toHaveAttribute("href", "/");
  await page.getByRole("main").getByRole("link", { name: "管理画面", exact: true }).click();
  await expect(page).toHaveTitle("コンテンツ管理 | pro_shunsuke");
  const configUrl = await page.locator('link[rel="cms-config-url"]').getAttribute("href");
  expect(configUrl).toMatch(/^\/admin\/config\.[a-f0-9]{12}\.yml$/);
  const response = await request.get(configUrl!);
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("proshunsuke/proshunsuke.github.io");
});

test("未知のURLはHTTP 404を返し、ホームに戻れる", async ({ page }) => {
  for (const path of ["/missing-page/", "/posts/missing-post/", "/posts/test-post-1/"]) {
    expect((await page.goto(path))?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible();
    await expect(page.locator("script")).toHaveCount(0);
  }
  await page.getByRole("link", { name: "ホームへ戻る" }).click();
  await expect(page).toHaveURL("/");
});

test("職務経歴書のインラインコードにバッククォートの装飾を付けない", async ({ page }) => {
  await page.goto("/resume/");
  const code = page
    .locator("article code")
    .filter({ hasText: /^pro_shunsuke$/ })
    .first();
  await expect(code).toBeVisible();
  for (const pseudo of ["::before", "::after"]) {
    expect(
      await code.evaluate(
        (element, selector) => getComputedStyle(element, selector).content,
        pseudo,
      ),
    ).toMatch(/^(none|normal|"")$/);
  }
});

test("遷移中は読み込み状態を表示し、完了すると解除する", async ({ page }) => {
  await page.goto("/");
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/*.data*", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.locator('main a[href="/resume/"]').click();
    await expect(page.getByRole("status")).toHaveText("ページを読み込んでいます…");
    await expect(page.locator('[aria-busy="true"]')).toHaveCount(1);
  } finally {
    release();
  }
  await expect(page.getByRole("heading", { name: "職務経歴書", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toBeEmpty();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
});
