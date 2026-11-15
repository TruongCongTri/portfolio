'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n/client';
import { hasPrivateHint } from '@/lib/privateHint';
import PillButton from '@/components/ui/PillButton/PillButton';
import styles from './PrivateUnlock.module.css';

const CLICKS = 5;
/** Longest pause between two clicks of the sequence. */
const WINDOW_MS = 600;

/**
 * Hidden way into private work from a new device: click (or tap) the element holding `onClick`
 * five times quickly. An unlocked browser goes straight to /work/private; otherwise a key prompt
 * opens, and submitting it loads /work/private?key=… (a full page load, so the proxy can set the
 * cookie; a wrong key ends on the ordinary 404). Render `dialog` anywhere.
 */
export function usePrivateUnlock() {
  const { t, href } = useI18n();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clicks = useRef({ count: 0, last: 0 });

  const onClick = useCallback(() => {
    const now = Date.now();
    const c = clicks.current;
    c.count = now - c.last < WINDOW_MS ? c.count + 1 : 1;
    c.last = now;
    if (c.count < CLICKS) return;
    c.count = 0;

    if (hasPrivateHint()) {
      router.push(href('/work/private'));
      return;
    }
    if (inputRef.current) inputRef.current.value = '';
    dialogRef.current?.showModal();
  }, [href, router]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const key = inputRef.current?.value.trim();
    if (!key) return;
    // A full page load on purpose: proxy.ts answers with a Set-Cookie redirect, which must land as a
    // real navigation so the page then renders with the new cookie.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`${href('/work/private')}?key=${encodeURIComponent(key)}`);
  };

  const close = () => dialogRef.current?.close();

  const dialog = (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      // A click on the backdrop lands on the <dialog> itself
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <form className={styles.form} onSubmit={submit}>
        <label className={styles.label}>
          {t.work.privateKey}
          <input
            ref={inputRef}
            className={styles.input}
            type="password"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            required
          />
        </label>
        <div className={styles.actions}>
          <PillButton onClick={close}>{t.work.privateCancel}</PillButton>
          <PillButton type="submit" variant="solid">
            {t.work.privateUnlock}
          </PillButton>
        </div>
      </form>
    </dialog>
  );

  return { onClick, dialog };
}
