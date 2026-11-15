/**
 * Readable marker that this browser has unlocked private work. It holds no secret: it only decides
 * whether the "Private" button shows. Access itself is the httpOnly cookie that proxy.ts checks
 * (lib/privateAccess.ts), which sets and clears this one alongside it. Safe for client code.
 */
export const PRIVATE_HINT_COOKIE = 'pw_hint';

export function hasPrivateHint() {
  return document.cookie.split('; ').some((c) => c === `${PRIVATE_HINT_COOKIE}=1`);
}

/** The cookie only changes on a full page load (the unlock redirect), so there's nothing to watch. */
export const subscribePrivateHint = () => () => {};
