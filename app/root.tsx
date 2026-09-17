import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
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
      <header className="border-b border-line bg-surface">
        <div className="page-width flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
          <Link to="/" className="text-lg font-bold tracking-tight">
            pro_shunsuke<span className="text-accent">.</span>
          </Link>
          <nav
            aria-label="メインナビゲーション"
            className="order-last flex w-full flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium md:order-none md:w-auto"
          >
            <NavLink to="/resume/">職務経歴書</NavLink>
            <NavLink to="/posts/">ブログ</NavLink>
            <NavLink to="/about-page/">このページについて</NavLink>
          </nav>
          <ThemeSelect />
        </div>
      </header>
      <main id="main" tabIndex={-1} className="min-h-[70vh]">
        {children}
      </main>
      <footer className="mt-16 border-t border-line">
        <div className="page-width flex flex-wrap items-center justify-between gap-6 py-8 text-sm text-muted">
          <p>pro_shunsuke’s page</p>
          <div className="flex gap-6">
            <a href="https://github.com/proshunsuke">GitHub ↗</a>
            <a href="https://twitter.com/pro_shunsuke">Twitter ↗</a>
          </div>
        </div>
      </footer>
      <ScrollRestoration />
      <Scripts />
    </body>
  </html>
);
const App = () => (
  <>
    <Outlet />
    <Analytics />
  </>
);
export default App;
export const ErrorBoundary = ({ error }: { error: unknown }) => (
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
