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
    <fieldset
      aria-label="配色"
      disabled={theme === null}
      style={{ visibility: theme === null ? "hidden" : "visible" }}
      className="relative grid shrink-0 grid-cols-3 rounded-full border border-line bg-wash p-1 shadow-inner"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-surface shadow-sm motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out"
        style={{
          transform: `translateX(${theme === "dark" ? 200 : theme === "light" ? 100 : 0}%)`,
        }}
      />
      {(
        [
          { value: "system", label: "自動", path: "M4 4h16v12H4zM8 20h8M12 16v4" },
          {
            value: "light",
            label: "ライト",
            path: "M12 3V2M12 22v-1M3 12H2M22 12h-1M5.6 5.6l-.7-.7M19.1 19.1l-.7-.7M5.6 18.4l-.7.7M19.1 4.9l-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
          },
          {
            value: "dark",
            label: "ダーク",
            path: "M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z",
          },
        ] satisfies { value: Theme; label: string; path: string }[]
      ).map((option) => (
        <label key={option.value} className="relative cursor-pointer" title={option.label}>
          <input
            type="radio"
            name="theme"
            value={option.value}
            checked={theme === option.value}
            onChange={() => setTheme(option.value)}
            className="peer sr-only"
          />
          <span className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold text-muted peer-checked:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:text-ink motion-safe:transition-colors">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d={option.path} />
            </svg>
            <span className="sr-only lg:not-sr-only">{option.label}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
};
