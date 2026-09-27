export const themes = ['dark', 'light'] as const;
export type Theme = (typeof themes)[number];

export const THEME_STORAGE_KEY = 'theme';

/**
 * Runs in <head> before first paint: applies the saved theme, else light (the design's default).
 * Kept as a string so it can be inlined without waiting for any bundle. Mirrors `resolveTheme` + `applyTheme`.
 */
export const themeInitScript = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}if(t!=='dark'&&t!=='light'){t='light'}d.dataset.theme=t;d.style.colorScheme=t})()`;

/** Saved choice, else light (the design's default). */
export function resolveTheme(): Theme {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode) — fall through to the default.
  }
  return saved === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage unavailable — theme still applies for this page view.
  }
}

/** Notifies when <html data-theme> changes, for useSyncExternalStore. */
export function subscribeTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/**
 * React owns <html>'s attributes and strips ones it didn't render whenever it re-creates the root
 * layout on the client (e.g. rendering the 404 page). Re-apply the theme whenever that happens.
 */
export function guardTheme() {
  const restore = () => {
    if (!document.documentElement.dataset.theme) applyTheme(resolveTheme());
  };
  restore();
  return subscribeTheme(restore);
}
