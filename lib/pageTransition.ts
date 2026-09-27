/**
 * Lets non-link code (e.g. the previous-project pull gesture) navigate through the page-transition
 * curtain. <PageTransition> registers the real implementation.
 */
type Navigator = (href: string) => void;

let navigator: Navigator | null = null;

export function registerPageNavigator(fn: Navigator | null) {
  navigator = fn;
}

/** Navigates with the curtain transition; returns false if none is mounted (caller falls back). */
export function transitionTo(href: string) {
  if (!navigator) return false;
  navigator(href);
  return true;
}
