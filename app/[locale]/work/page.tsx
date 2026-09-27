import type { Metadata } from 'next';
import { getProjects } from '@/lib/projects';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { pageMetadata, workCollectionSchema } from '@/lib/seo';
import { site } from '@/lib/site';
import WorkExplorer from '@/components/work/WorkExplorer/WorkExplorer';
import Footer from '@/components/layout/Footer/Footer';
import JsonLd from '@/components/seo/JsonLd/JsonLd';
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
  const projects = getProjects(locale);

  return (
    <>
      <JsonLd data={workCollectionSchema(locale, getDictionary(locale), projects)} />
      <main className={styles.main}>
        <WorkExplorer projects={projects} />
      </main>
      <Footer />
    </>
  );
}
