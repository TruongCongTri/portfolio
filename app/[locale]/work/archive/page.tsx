import type { Metadata } from 'next';
import { getArchivedProjects } from '@/lib/projects';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { pageMetadata, workCollectionSchema } from '@/lib/seo';
import { site } from '@/lib/site';
import WorkExplorer from '@/components/work/WorkExplorer/WorkExplorer';
import Footer from '@/components/layout/Footer/Footer';
import JsonLd from '@/components/seo/JsonLd/JsonLd';
import ProjectLinks from '@/components/seo/ProjectLinks/ProjectLinks';
import styles from '../page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/work/archive',
    title: t.work.archive,
    shareTitle: `${t.work.archive} — ${site.name}`,
    description: t.meta.archiveDescription,
  });
}

/** Archived work. A static segment, so it wins over /work/[slug] (no project may use the slug "archive"). */
export default async function ArchivePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const projects = getArchivedProjects(locale);

  return (
    <>
      <JsonLd data={workCollectionSchema(locale, t, projects, true)} />
      <main className={styles.main}>
        <WorkExplorer projects={projects} title={t.work.archiveTitle} />
        <ProjectLinks projects={projects} locale={locale} label={t.work.allProjects} />
      </main>
      <Footer />
    </>
  );
}
