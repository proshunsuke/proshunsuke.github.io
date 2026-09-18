import { Link, NavLink } from "react-router";
import { ThemeSelect } from "~/components/theme";

export const SiteHeader = () => (
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
        <NavLink to="/about/">このサイトについて</NavLink>
        <a href="/admin/index.html">管理画面</a>
      </nav>
      <ThemeSelect />
    </div>
  </header>
);
