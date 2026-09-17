import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { render, cleanup } from "vitest-browser-react";
import { createMemoryRouter, RouterProvider } from "react-router";

type AnalyticsWindow = Window & { dataLayer?: unknown[][]; gtag?: (...args: unknown[]) => void };
const analyticsWindow = window as AnalyticsWindow;

beforeEach(() => {
  vi.resetModules();
  delete analyticsWindow.dataLayer;
  delete analyticsWindow.gtag;
  // Check script creation without contacting Google or polluting production metrics.
  vi.spyOn(document.head, "append").mockImplementation(() => {});
});
afterEach(async () => {
  await cleanup();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  delete analyticsWindow.dataLayer;
  delete analyticsWindow.gtag;
});

test.each(["", "invalid", "G-<script>"])("計測ID %s が未設定・不正なら初期化しない", async (id) => {
  vi.stubEnv("VITE_GOOGLE_ANALYTICS_ID", id);
  const { Analytics } = await import("~/components/analytics");
  const router = createMemoryRouter([{ path: "*", element: <Analytics /> }]);
  await render(<RouterProvider router={router} />);
  expect(document.head.append).not.toHaveBeenCalled();
  expect(analyticsWindow.gtag).toBeUndefined();
});

test("初期化は一度だけ行い、パス・クエリ変更だけを計測する", async () => {
  vi.stubEnv("VITE_GOOGLE_ANALYTICS_ID", "G-TEST123");
  const { Analytics } = await import("~/components/analytics");
  const router = createMemoryRouter([{ path: "*", element: <Analytics /> }]);
  await render(<RouterProvider router={router} />);
  const views = () =>
    analyticsWindow.dataLayer?.filter(
      ([event, name]) => event === "event" && name === "page_view",
    ) ?? [];
  await expect.poll(() => views().length).toBe(1);
  expect(analyticsWindow.dataLayer).toContainEqual([
    "config",
    "G-TEST123",
    { send_page_view: false },
  ]);
  expect(document.head.append).toHaveBeenCalledOnce();
  const script = vi.mocked(document.head.append).mock.calls[0][0] as HTMLScriptElement;
  expect(script.src).toBe("https://www.googletagmanager.com/gtag/js?id=G-TEST123");
  await router.navigate("/resume/");
  await expect.poll(() => views().length).toBe(2);
  await router.navigate("/resume/#section");
  expect(views()).toHaveLength(2);
  await router.navigate("/resume/?from=test");
  await expect.poll(() => views().length).toBe(3);
  await router.navigate("/resume/?from=test");
  expect(views()).toHaveLength(3);
  expect(document.head.append).toHaveBeenCalledOnce();
});
