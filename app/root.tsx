import type { Route } from "./+types/root";
import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  useNavigation,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "react-router";
import { ThemeSelect, themeScript } from "~/components/theme";
import { Analytics } from "~/components/analytics";
import "~/style.css";

export const Layout = ({ children }: { children: ReactNode }) => (
  <html lang="ja" suppressHydrationWarning>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <Meta />
      <Links />
      <link rel="icon" href="/favicons/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
      <meta name="color-scheme" content="light dark" />
    </head>
    <body>
      <a href="#main" className="skip-link">
        本文へ移動
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
        <div className="page-width flex flex-wrap items-center justify-between gap-x-3 gap-y-3 py-3">
          <Link to="/" className="text-base font-bold tracking-tight sm:text-lg">
            pro_shunsuke<span className="text-accent">.</span>
          </Link>
          <nav
            aria-label="メインナビゲーション"
            className="order-last flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium md:order-none md:w-auto"
          >
            <NavLink to="/resume/">職務経歴書</NavLink>
            <NavLink to="/posts/">ブログ</NavLink>
            <NavLink to="/about-page/">このページについて</NavLink>
            <a href="/admin/index.html">管理画面</a>
          </nav>
          <ThemeSelect />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="min-h-[70vh]">
        {children}
      </main>
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
);
const App = () => {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";
  return (
    <>
      <div role="status" aria-live="polite" className="fixed right-5 bottom-5 z-50">
        {isNavigating && (
          <span className="flex items-center gap-3 rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink shadow-lg">
            <span
              aria-hidden="true"
              className="size-4 rounded-full border-2 border-line border-t-accent motion-safe:animate-spin"
            />
            ページを読み込んでいます…
          </span>
        )}
      </div>
      <div aria-busy={isNavigating}>
        <Outlet />
      </div>
      <Analytics />
    </>
  );
};
export default App;
export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => (
  <div className="page-width py-24">
    <p className="eyebrow">{isRouteErrorResponse(error) ? error.status : "ERROR"}</p>
    <h1 className="mt-4 text-3xl font-bold">
      {isRouteErrorResponse(error) && error.status === 404
        ? "ページが見つかりません"
        : "ページを表示できませんでした"}
    </h1>
    <Link to="/" className="mt-8 inline-block text-accent underline">
      ホームへ戻る
    </Link>
  </div>
);
