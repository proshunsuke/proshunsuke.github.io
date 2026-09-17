import type { Route } from "./+types/root";
import type { ReactNode } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "react-router";
import { themeScript } from "~/components/theme";
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
      {children}
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
export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => (
  <main className="page-width py-24">
    <p className="eyebrow">{isRouteErrorResponse(error) ? error.status : "ERROR"}</p>
    <h1 className="mt-4 text-3xl font-bold">
      {isRouteErrorResponse(error) && error.status === 404
        ? "ページが見つかりません"
        : "ページを表示できませんでした"}
    </h1>
    <Link to="/" className="mt-8 inline-block text-accent underline">
      ホームへ戻る
    </Link>
  </main>
);
