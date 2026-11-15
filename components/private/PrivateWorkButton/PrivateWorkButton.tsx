'use client';

import { useSyncExternalStore } from 'react';
import { useI18n } from '@/lib/i18n/client';
import { hasPrivateHint, subscribePrivateHint } from '@/lib/privateHint';
import PillButton from '@/components/ui/PillButton/PillButton';

/**
 * "Private" pill, shown only in a browser that has unlocked private work (see lib/privateHint).
 * Rendered after hydration (the server snapshot is "hidden"), so /work stays one static page.
 */
export default function PrivateWorkButton() {
  const { t, href } = useI18n();
  const unlocked = useSyncExternalStore(subscribePrivateHint, hasPrivateHint, () => false);
  if (!unlocked) return null;

  return (
    <PillButton href={href('/work/private')} variant="outline" size="lg" magnetic>
      {t.work.private}
    </PillButton>
  );
}
