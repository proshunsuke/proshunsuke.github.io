import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';
export const themeScript = `(()=>{try{const t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch{document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})()`;

export const ThemeSelect = () => {
  const [theme, setTheme] = useState<Theme>('system');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') setTheme(stored);
    } catch {
      /* Storage may be unavailable. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme, ready]);
  return (
    <label className="flex items-center gap-2 text-xs text-muted">
      <span>配色</span>
      <select
        aria-label="配色"
        value={theme}
        onChange={(event) => {
          const next = event.target.value as Theme;
          setTheme(next);
          try {
            if (next === 'system') localStorage.removeItem('theme');
            else localStorage.setItem('theme', next);
          } catch {
            /* Keep the current session usable. */
          }
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
