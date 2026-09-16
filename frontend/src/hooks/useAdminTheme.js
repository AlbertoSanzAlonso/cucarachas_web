import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'cecsa_admin_theme';

function readStoredTheme() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'dark' || value === 'light') return value;
  } catch {
    /* ignore */
  }
  return 'light';
}

/**
 * Theme for the admin dashboard shell only (not public site).
 * Persists light|dark in localStorage under cecsa_admin_theme.
 */
export function useAdminTheme() {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    setThemeState(next === 'dark' ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };
}
