import { Link } from "react-router";
import { ThemeSelect } from "~/components/theme";

export const SiteHeader = () => (
  <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
    <div className="page-width flex flex-wrap items-center justify-between gap-x-3 gap-y-3 py-3">
      <Link to="/" className="text-base font-bold tracking-tight sm:text-lg">
        pro_shunsuke<span className="text-accent">.</span>
      </Link>
      <ThemeSelect />
    </div>
  </header>
);
