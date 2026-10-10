import { useSyncExternalStore } from 'react';

/** Below this width there's no hover, so hover-driven UI (the list's cursor-trailing preview) can't work. */
const MOBILE_QUERY = '(max-width: 767px)';

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
};

/** True on phone-width screens (false while server-rendering). */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(MOBILE_QUERY).matches, () => false);
}
