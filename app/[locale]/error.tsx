'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n/client';
import ErrorScreen from '@/components/errors/ErrorScreen/ErrorScreen';
import PillButton from '@/components/ui/PillButton/PillButton';

type ErrorPageProps = {
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the failed segment. */
  retry: () => void;
};

/**
 * Runtime errors in any page under a locale. Rendered inside the locale layout, so the header,
 * theme and language all keep working. Errors in the layout itself fall through to global-error.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const { t, href } = useI18n();

  useEffect(() => {
    // Hook an error-reporting service in here.
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code={t.error.code}
      title={t.error.title}
      body={t.error.body}
      actions={
        <>
          <PillButton onClick={retry} variant="solid" arrow magnetic>
            {t.error.retry}
          </PillButton>
          <PillButton href={href('/')} arrow magnetic>
            {t.error.home}
          </PillButton>
        </>
      }
      footnote={error.digest ? `${t.error.reference}: ${error.digest}` : undefined}
    />
  );
}
