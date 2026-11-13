import { afterEach, expect, test } from "vite-plus/test";
import { page } from "vite-plus/test/browser";
import { render, cleanup } from "vitest-browser-react";
import { Article } from "~/components/article";
import "~/style.css";

afterEach(async () => {
  await cleanup();
});

test("本文のh1とは別にタイトルと日付を表示し、コードに装飾を付けない", async () => {
  await render(
    <Article
      title="テスト記事"
      category="TEST"
      html="<h1>本文タイトル</h1><p><code>example</code></p>"
      headings={[]}
      publishedAt="2022-01-23"
      updatedAt="2024-02-29"
    />,
  );
  await expect
    .element(page.getByRole("heading", { name: "テスト記事", exact: true }))
    .toBeVisible();
  await expect
    .element(page.getByRole("heading", { name: "本文タイトル", exact: true }))
    .toBeVisible();
  await expect.element(page.getByText("公開日：2022/01/23")).toBeVisible();
  await expect.element(page.getByText("更新日：2024/02/29")).toBeVisible();
  expect(
    Array.from(document.querySelectorAll("header time"), (time) => time.getAttribute("datetime")),
  ).toEqual(["2024-02-29", "2022-01-23"]);
  const code = page.getByRole("code");
  await expect.element(code).toBeVisible();
  for (const pseudo of ["::before", "::after"]) {
    expect(getComputedStyle(code.element(), pseudo).content).toMatch(/^(none|normal|"")$/);
  }
  await expect.element(page.getByRole("navigation", { name: "目次" })).not.toBeInTheDocument();
});

test("日付がない記事でも表示でき、目次はh2配下にh3をまとめる", async () => {
  await render(
    <Article
      title="テスト記事"
      category="TEST"
      html="<h3 id='intro'>前置き</h3><h2 id='chapter'>章</h2><h3 id='detail'>詳細</h3>"
      headings={[
        { id: "intro", label: "前置き", level: 3 },
        { id: "chapter", label: "章", level: 2 },
        { id: "detail", label: "詳細", level: 3 },
      ]}
    />,
  );
  expect(document.querySelectorAll("header time")).toHaveLength(0);
  const toc = page.getByRole("navigation", { name: "目次", exact: true });
  await expect.element(toc).toBeVisible();
  expect(toc.element().querySelectorAll(":scope > ul > li")).toHaveLength(2);
  const nested = toc.element().querySelector("li > ul a");
  expect(nested?.textContent).toBe("詳細");
  expect(nested?.getAttribute("href")).toBe("#detail");
});
