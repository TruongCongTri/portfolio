import type { Metadata } from 'next';
import { getHiddenProjects, privatePageCopy } from '@/lib/hiddenProjects';
import { getLocale } from '@/lib/i18n/server';
import WorkExplorer from '@/components/work/WorkExplorer/WorkExplorer';
import Footer from '@/components/layout/Footer/Footer';
import styles from '../page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  // Linked from nowhere, never in the sitemap, never indexed.
  return { title: privatePageCopy[locale].metaTitle, robots: { index: false, follow: false, nocache: true } };
}

/**
 * Personal projects. Prerendered like every page, but proxy.ts only serves it to a browser holding
 * the access cookie (set by visiting /work/private?key=<PRIVATE_WORK_KEY>, see lib/privateAccess);
 * everyone else gets the ordinary 404. A static segment, so it wins over /work/[slug].
 */
export default async function PrivateWorkPage() {
  const locale = await getLocale();

  return (
    <>
      <main className={styles.main}>
        <WorkExplorer projects={getHiddenProjects(locale)} title={privatePageCopy[locale].title} />
      </main>
      <Footer />
    </>
  );
}
