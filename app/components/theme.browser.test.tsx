import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render, cleanup } from "vitest-browser-react";
import "~/style.css";

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});
afterEach(async () => {
  await cleanup();
  vi.restoreAllMocks();
  localStorage.clear();
});

test.each([
  [null, "自動", "light"],
  ["invalid", "自動", "light"],
  ["light", "ライト", "light"],
  ["dark", "ダーク", "dark"],
])("保存値 %s を読み込み、選択状態と配色を一致させる", async (stored, label, color) => {
  if (stored !== null) localStorage.setItem("theme", stored);
  const { ThemeSelect } = await import("~/components/theme");
  await render(<ThemeSelect />);
  await expect.element(page.getByRole("radio", { name: label })).toBeChecked();
  await expect.poll(() => document.documentElement.dataset.theme).toBe(color);
});

test("配色を選択すると保存し、自動に戻すと保存を解除する", async () => {
  const { ThemeSelect } = await import("~/components/theme");
  await render(<ThemeSelect />);
  await page.getByTitle("ダーク", { exact: true }).click();
  await expect.element(page.getByRole("radio", { name: "ダーク" })).toBeChecked();
  expect(localStorage.getItem("theme")).toBe("dark");
  await expect.poll(() => document.documentElement.dataset.theme).toBe("dark");
  await page.getByTitle("自動", { exact: true }).click();
  expect(localStorage.getItem("theme")).toBeNull();
  await expect.poll(() => document.documentElement.dataset.theme).toBe("light");
});

test("キーボードで配色を選択できる", async () => {
  const { ThemeSelect } = await import("~/components/theme");
  await render(<ThemeSelect />);
  await userEvent.tab();
  await expect.element(page.getByRole("radio", { name: "自動" })).toHaveFocus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(page.getByRole("radio", { name: "ライト" })).toBeChecked();
});

test("別タブからの配色変更と保存解除を反映する", async () => {
  const { ThemeSelect } = await import("~/components/theme");
  await render(<ThemeSelect />);
  localStorage.setItem("theme", "dark");
  window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: "dark" }));
  await expect.element(page.getByRole("radio", { name: "ダーク" })).toBeChecked();
  localStorage.clear();
  window.dispatchEvent(new StorageEvent("storage", { key: null }));
  await expect.element(page.getByRole("radio", { name: "自動" })).toBeChecked();
});

test("保存領域が使えなくてもセッション中は配色を変更できる", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new DOMException("denied", "SecurityError");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new DOMException("denied", "SecurityError");
  });
  const { ThemeSelect } = await import("~/components/theme");
  await render(<ThemeSelect />);
  await page.getByTitle("ダーク", { exact: true }).click();
  await expect.element(page.getByRole("radio", { name: "ダーク" })).toBeChecked();
  await expect.poll(() => document.documentElement.dataset.theme).toBe("dark");
});
