/**
 * Rough "is this an older / constrained device" check, for scaling back effects that cost a lot to paint.
 * Few CPU cores, little memory or Data Saver all count. Browsers that don't report these (Safari) are
 * treated as capable. The result is also written to <html data-perf="low|high"> before first paint
 * (see `perfInitScript`), so CSS can react to it too.
 */
export function isLowEndDevice() {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return Boolean(nav.connection?.saveData) || (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
}

/** Inline script (runs in <head>): marks <html> so stylesheets can drop expensive effects on weak devices. */
export const perfInitScript = `(function(){var n=navigator,c=n.connection;document.documentElement.dataset.perf=(c&&c.saveData)||(n.hardwareConcurrency||8)<=4||(n.deviceMemory||8)<=4?'low':'high'})()`;
