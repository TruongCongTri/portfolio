import Link from 'next/link';
import { localizePath } from '@/lib/i18n/config';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary } from '@/lib/i18n/dictionaries';
import styles from './not-found.module.css';

export default async function NotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale).notFound;

  return (
    <main className={styles.main}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>{t.title}</h1>
      <p className={styles.body}>{t.body}</p>
      <Link href={localizePath(locale, '/')} className={styles.link}>
        {t.back}
      </Link>
    </main>
  );
}
