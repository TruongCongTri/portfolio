/**
 * Marks the next navigation as "seamless": the destination is already on screen (the next-project
 * hand-off renders the next hero in place), so the page fade and hero intro must be skipped.
 *
 * Set right before `router.push`; read by the destination's components during their first effects;
 * cleared by the page template once everything has mounted.
 */
let seamless = false;

export function markSeamlessNavigation() {
  seamless = true;
}

export function isSeamlessNavigation() {
  return seamless;
}

export function clearSeamlessNavigation() {
  seamless = false;
}

/**
 * Marks the next navigation as covered by the page-transition curtain, so the page template
 * skips its own fade (the curtain already hides the swap).
 */
let curtain = false;

export function markCurtainNavigation() {
  curtain = true;
}

export function consumeCurtainNavigation() {
  const was = curtain;
  curtain = false;
  return was;
}
