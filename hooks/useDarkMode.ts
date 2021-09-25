import {useCallback, useEffect, useState} from 'react'
import {useTheme} from 'next-themes';

type UseDarkMode = () => {
  isDarkMode: boolean;
  toggle: () => void;
  mounted: boolean;
}

export const useDarkMode: UseDarkMode = () => {
  const { theme, setTheme } = useTheme();
  const dark = theme === 'dark';
  const [isDarkMode, setIsDarkMode] = useState(dark);
  const [mounted, setMounted] = useState(false);
  const toggle = useCallback(() => {
    const newMode = !dark;
    setIsDarkMode(newMode);
  }, [dark]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setTheme(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode, setTheme]);

  return { isDarkMode, toggle, mounted }
};
