import type { Metadata } from 'next';
import Link from 'next/link';
import { getProjects } from '@/lib/projects';
import { localizePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import ErrorScreen from '@/components/errors/ErrorScreen/ErrorScreen';
import PillButton from '@/components/ui/PillButton/PillButton';
import styles from './not-found.module.css';

export const metadata: Metadata = { title: '404', robots: { index: false, follow: true } };

/** Unknown project slug: suggests the real projects instead. */
export default async function ProjectNotFound() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <ErrorScreen
      code={t.notFound.code}
      title={t.projectNotFound.title}
      body={t.projectNotFound.body}
      actions={
        <PillButton href={localizePath(locale, '/work')} arrow magnetic>
          {t.projectNotFound.all}
        </PillButton>
      }
    >
      <ul className={styles.list}>
        {getProjects(locale).map((project) => (
          <li key={project.slug}>
            <Link href={localizePath(locale, `/work/${project.slug}`)} className={styles.item}>
              <span className={styles.swatch} style={{ backgroundColor: project.color }} aria-hidden />
              <span className={styles.name}>{project.title}</span>
              <span className={styles.meta}>{t.work.categories[project.category]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </ErrorScreen>
  );
}
