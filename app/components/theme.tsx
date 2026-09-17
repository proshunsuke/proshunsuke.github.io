import { useEffect, useSyncExternalStore } from "react";

type Theme = "system" | "light" | "dark";
export const themeScript = `(()=>{try{const t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})()`;

let sessionTheme: Theme | null = null;
const listeners = new Set<() => void>();
const getTheme = () => {
  if (sessionTheme !== null) return sessionTheme;
  try {
    const stored = localStorage.getItem("theme");
    return stored === "dark" || stored === "light" ? stored : "system";
  } catch {
    return "system";
  }
};
// Keep the generated HTML and the first hydration render identical.
const getServerTheme = () => null;
const subscribeTheme = (notify: () => void) => {
  listeners.add(notify);
  const onStorage = (event: StorageEvent) => {
    if (event.key === "theme" || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(notify);
    window.removeEventListener("storage", onStorage);
  };
};
const setTheme = (theme: Theme) => {
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
    sessionTheme = null;
  } catch {
    /* Keep the current session usable when storage is unavailable. */
    sessionTheme = theme;
  }
  // The storage event only fires in other documents.
  listeners.forEach((notify) => notify());
};

export const ThemeSelect = () => {
  const theme = useSyncExternalStore<Theme | null>(subscribeTheme, getTheme, getServerTheme);
  useEffect(() => {
    if (theme === null) return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span>配色</span>
      <select
        aria-label="配色"
        value={theme ?? "system"}
        disabled={theme === null}
        style={{ visibility: theme === null ? "hidden" : "visible" }}
        onChange={(event) => {
          const next = event.target.value as Theme;
          setTheme(next);
        }}
        className="min-h-11 rounded-lg border border-line bg-surface px-2 text-sm text-ink"
      >
        <option value="system">自動</option>
        <option value="light">ライト</option>
        <option value="dark">ダーク</option>
      </select>
    </label>
  );
};
