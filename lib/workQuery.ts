import { useMemo, useSyncExternalStore } from 'react';

/**
 * The Work page keeps its filters and layout in the URL (`?category=…&live=true&git=web&view=list`),
 * so a view can be shared, refreshed and navigated with back/forward. These helpers read the query
 * string as an external store and write it with the native History API (which Next.js integrates with
 * its router), leaving the static page as is: no Suspense bailout, and the server render stays the
 * default, unfiltered one.
 */

const CHANGE_EVENT = 'work-query-change';

let patched = false;
/** Next's router navigates with pushState/replaceState, which fire no event: announce them ourselves. */
function patchHistory() {
  if (patched) return;
  patched = true;
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = window.history[method];
    window.history[method] = function (this: History, ...args: Parameters<History['pushState']>) {
      const result = original.apply(this, args);
      // Deferred: the router calls these during its commit, where subscribers must not re-render synchronously
      queueMicrotask(() => window.dispatchEvent(new Event(CHANGE_EVENT)));
      return result;
    };
  }
}

function subscribe(onChange: () => void) {
  patchHistory();
  window.addEventListener('popstate', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/**
 * The current query string, as URLSearchParams ('' on the server, so the first render is the default).
 * The object only changes when the query string does, so it is safe in dependency arrays.
 */
export function useQueryParams() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => '');
  return useMemo(() => new URLSearchParams(search), [search]);
}

/** Sets (or, with null, removes) query values on the current URL, without adding a history entry. */
export function updateQuery(changes: Record<string, string | null>) {
  const params = new URLSearchParams(window.location.search);
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  if (url === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
  window.history.replaceState(window.history.state, '', url);
}

/** Sets `key` to `value`, or removes it if it already has that value. Reads the URL itself, so callers needn't depend on it. */
export function toggleQuery(key: string, value: string) {
  const current = new URLSearchParams(window.location.search).get(key);
  updateQuery({ [key]: current === value ? null : value });
}

/* ---- Remembered layout --------------------------------------------------------------------- */

export type ViewMode = 'list' | 'grid';
const VIEW_KEY = 'work-view';

const parseView = (value: string | null): ViewMode | null => (value === 'list' || value === 'grid' ? value : null);

function readStoredView(): ViewMode | null {
  try {
    return parseView(localStorage.getItem(VIEW_KEY));
  } catch {
    return null; // Storage unavailable (private mode)
  }
}

function subscribeStoredView(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** The layout last chosen in this browser (null on the server and before any choice). */
export function useStoredView() {
  return useSyncExternalStore(subscribeStoredView, readStoredView, () => null);
}

/** Remembers the layout and puts it in the URL. */
export function chooseView(view: ViewMode) {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Storage unavailable — the URL still carries it for this visit.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  updateQuery({ view });
}

export { parseView };
