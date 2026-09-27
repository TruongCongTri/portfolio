import type { Metadata } from 'next';
import { getProjects } from '@/lib/projects';
import { getLocale, getT } from '@/lib/i18n/server';
import WorkExplorer from '@/components/work/WorkExplorer/WorkExplorer';
import Footer from '@/components/layout/Footer/Footer';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).nav.work };
}

export default async function WorkPage() {
  const projects = getProjects(await getLocale());

  return (
    <>
      <main className={styles.main}>
        <WorkExplorer projects={projects} />
      </main>
      <Footer />
    </>
  );
}
