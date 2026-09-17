import { expect, test } from "#tests/e2e/fixtures";

for (const scenario of [
  { name: "保存済みダーク", stored: "dark", os: "light", expected: "dark" },
  { name: "保存済みライト", stored: "light", os: "dark", expected: "light" },
  { name: "OSダーク", stored: null, os: "dark", expected: "dark" },
  { name: "不正な保存値", stored: "invalid", os: "dark", expected: "dark" },
  { name: "保存領域の拒否", stored: null, os: "dark", expected: "dark", denied: true },
] as const) {
  test(`${scenario.name}: React起動前から正しい配色を適用する`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scenario.os });
    await page.addInitScript(
      ({ stored, denied }) => {
        if (stored !== null) localStorage.setItem("theme", stored);
        if (denied)
          Object.defineProperty(Storage.prototype, "getItem", {
            value: () => {
              throw new DOMException("denied", "SecurityError");
            },
          });
      },
      { stored: scenario.stored, denied: "denied" in scenario },
    );
    // Block module scripts, but let the inline head script and CSS run normally.
    await page.route("**/assets/*.js", (route) => route.abort());
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", scenario.expected);
    const before = await page
      .locator("body")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    await page.unroute("**/assets/*.js");
    await page.reload();
    await expect(page.getByRole("group", { name: "配色" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", scenario.expected);
    await expect(page.locator("body")).toHaveCSS("background-color", before);
  });
}

test("選択表示がスライドし、動きを減らす設定ではアニメーションを抑制する", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const indicator = page
    .getByRole("group", { name: "配色" })
    .locator(':scope > span[aria-hidden="true"]');
  await expect(page.getByRole("radio", { name: "自動", exact: true })).toBeChecked();
  await expect(indicator).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
  // Await registration, and retain the event even if the transition finishes before the assertion.
  await indicator.evaluate((element) => {
    element.addEventListener("transitionrun", (event) => {
      if (event.target === element && (event as TransitionEvent).propertyName === "transform")
        element.setAttribute("data-transition-started", "true");
    });
  });
  await page.getByTitle("ダーク", { exact: true }).click();
  await expect(indicator).toHaveAttribute("data-transition-started", "true");
  await indicator.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  const position = await indicator.evaluate(
    (element) => new DOMMatrix(getComputedStyle(element).transform).m41,
  );
  expect(position).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByTitle("ライト", { exact: true }).click();
  await expect(indicator).toHaveCSS("transition-duration", "0s");
  expect(await indicator.evaluate((element) => element.getAnimations().length)).toBe(0);
});
