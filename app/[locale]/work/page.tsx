import type { Metadata } from 'next';
import { getArchivedProjects, getProjects } from '@/lib/projects';
import { localizePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { pageMetadata, workCollectionSchema } from '@/lib/seo';
import { site } from '@/lib/site';
import WorkExplorer from '@/components/work/WorkExplorer/WorkExplorer';
import Footer from '@/components/layout/Footer/Footer';
import JsonLd from '@/components/seo/JsonLd/JsonLd';
import PillButton from '@/components/ui/PillButton/PillButton';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/work',
    title: t.nav.work,
    shareTitle: `${t.nav.work} — ${site.name}`,
    description: t.meta.workDescription,
  });
}

export default async function WorkPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const projects = getProjects(locale);
  const archivedCount = getArchivedProjects(locale).length;

  return (
    <>
      <JsonLd data={workCollectionSchema(locale, t, projects)} />
      <main className={styles.main}>
        <WorkExplorer projects={projects} />
        {archivedCount > 0 && (
          <div className={styles.more}>
            <PillButton href={localizePath(locale, '/work/archive')} variant="solid" size="lg" count={archivedCount} magnetic>
              {t.work.archive}
            </PillButton>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
