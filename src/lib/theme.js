import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'dr-theme';
const LIGHT_BG = '#f4f4f4';
const DARK_BG = '#080808';

function readStoredTheme() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getInitialTheme() {
  const current = document.documentElement.dataset.theme;
  if (current === 'light' || current === 'dark') return current;
  return readStoredTheme() || systemTheme();
}

function updateFavicon(theme) {
  const link = document.querySelector('link[rel="icon"]');
  if (!link) return;
  const current = link.getAttribute('href') || '';
  const file = theme === 'dark' ? 'favicon-dark.svg' : 'favicon-light.svg';
  const next = current.replace(/favicon(?:-light|-dark)?\.svg/, file);
  if (next !== current) link.setAttribute('href', next);
}

function applyTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? DARK_BG : LIGHT_BG);

  updateFavicon(theme);

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // The theme still works for this page if storage is unavailable.
    }
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event) => {
      if (readStoredTheme()) return;
      const next = event.matches ? 'dark' : 'light';
      applyTheme(next);
      setTheme(next);
    };

    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
    setTheme(next);
  }, [theme]);

  return { theme, toggle };
}
