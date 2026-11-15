import { NextResponse, type NextRequest } from 'next/server';
import { locales } from './i18n/config';
import { hiddenSlugs } from './hiddenSlugs';
import { PRIVATE_HINT_COOKIE } from './privateHint';

/*
 * Private work (/work/private and the hidden projects' detail pages) is unlisted and gated:
 *
 *   /work/private?key=<PRIVATE_WORK_KEY>  → sets an access cookie, redirects to the clean URL
 *   /work/private?key=anything-else       → clears the cookie (locks it again)
 *
 * Unlocking also sets a readable hint cookie (lib/privateHint.ts) that shows the "Private" button on
 * /work; it holds no secret. Without the access cookie those pages answer with the site's ordinary 404, so nothing hints that they
 * exist. With PRIVATE_WORK_KEY unset they are always 404.
 *
 * The gate lives in proxy.ts rather than the pages: the [locale] layout forces static rendering
 * (cookies() reads empty there), and the proxy runs before every page, static or not. The key is
 * read from process.env at request time and is never NEXT_PUBLIC_, so it can't reach the browser.
 */

const COOKIE = 'pw_access';
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days
const LOCALE = `(${locales.join('|')})`;
/** /work/private with or without a locale prefix (the unlock link may be typed without one). */
const UNLOCK_PATH = new RegExp(`^(?:/${LOCALE})?/work/private/?$`);
/** /{locale}/work/private and /{locale}/work/private/{slug}. */
const PRIVATE_PATH = new RegExp(`^/${LOCALE}/work/private(?:/[^/]+)?/?$`);
/** /{locale}/work/{slug}: where the work grid links every project, hidden ones included. */
const DETAIL_PATH = new RegExp(`^/${LOCALE}/work/([^/]+)/?$`);

/** The cookie holds a hash of the key, not the key itself. */
async function accessToken(key: string) {
  const data = new TextEncoder().encode(`private-work:${key}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time string comparison, so response timing doesn't leak how much matched. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hasAccess(request: NextRequest) {
  const key = process.env.PRIVATE_WORK_KEY;
  const token = request.cookies.get(COOKIE)?.value;
  if (!key || !token) return false;
  return safeEqual(token, await accessToken(key));
}

/** Private content must never sit in a shared cache or a search index. */
function markPrivate(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  return response;
}

/**
 * proxy.ts: unlocks, gates and routes private work. Returns a response for the requests it handles
 * and null for everything else (the rest of the proxy then runs as usual).
 */
export async function handlePrivateWork(request: NextRequest): Promise<NextResponse | null> {
  const { pathname, searchParams } = request.nextUrl;

  // 1. Unlock / lock: set or clear the cookie, then drop the key from the URL (history, Referer…)
  if (searchParams.has('key') && UNLOCK_PATH.test(pathname)) {
    const key = process.env.PRIVATE_WORK_KEY;
    const url = request.nextUrl.clone();
    url.searchParams.delete('key');
    const response = markPrivate(NextResponse.redirect(url));
    if (key && safeEqual(searchParams.get('key') ?? '', key)) {
      response.cookies.set(COOKIE, await accessToken(key), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: MAX_AGE,
      });
      response.cookies.set(PRIVATE_HINT_COOKIE, '1', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: MAX_AGE,
      });
    } else {
      response.cookies.delete(COOKIE);
      response.cookies.delete(PRIVATE_HINT_COOKIE);
    }
    return response;
  }

  // 2. The private pages themselves: the ordinary 404 without access
  const privateMatch = pathname.match(PRIVATE_PATH);
  if (privateMatch) {
    if (await hasAccess(request)) return markPrivate(NextResponse.next());
    // Any unmatched path renders the localized not-found page (app/[locale]/[...rest]) with a 404.
    const response = NextResponse.rewrite(new URL(`/${privateMatch[1]}/not-found`, request.url));
    // A stale hint (key changed, access cookie expired) would keep showing a dead button.
    if (request.cookies.has(PRIVATE_HINT_COOKIE)) response.cookies.delete(PRIVATE_HINT_COOKIE);
    return response;
  }

  // 3. /work/{hidden slug}: served from /work/private/{slug} with access; otherwise it falls
  //    through to /work/[slug], which doesn't know the slug and answers 404.
  const detailMatch = pathname.match(DETAIL_PATH);
  if (detailMatch && hiddenSlugs.includes(detailMatch[2]) && (await hasAccess(request))) {
    const url = request.nextUrl.clone();
    url.pathname = `/${detailMatch[1]}/work/private/${detailMatch[2]}`;
    return markPrivate(NextResponse.rewrite(url));
  }

  return null;
}
