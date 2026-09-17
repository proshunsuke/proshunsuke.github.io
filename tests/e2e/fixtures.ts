import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("https://www.googletagmanager.com/**", (route) =>
      route.fulfill({ contentType: "text/javascript", body: "" }),
    );
    await use(page);
  },
});
export { expect };
