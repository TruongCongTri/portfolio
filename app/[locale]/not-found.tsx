import type { Metadata } from 'next';
import { localizePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import ErrorScreen from '@/components/errors/ErrorScreen/ErrorScreen';
import PillButton from '@/components/ui/PillButton/PillButton';

export const metadata: Metadata = { title: '404', robots: { index: false, follow: true } };

/** Any unknown URL under a locale (the [...rest] catch-all calls notFound()). */
export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale).notFound;

  return (
    <ErrorScreen
      code={t.code}
      title={t.title}
      body={t.body}
      actions={
        <>
          <PillButton href={localizePath(locale, '/')} variant="solid" arrow magnetic>
            {t.back}
          </PillButton>
          <PillButton href={localizePath(locale, '/work')} arrow magnetic>
            {t.work}
          </PillButton>
        </>
      }
    />
  );
}
