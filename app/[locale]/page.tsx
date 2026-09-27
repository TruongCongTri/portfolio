import { getProjects } from '@/lib/projects';
import { localizePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import Hero from '@/components/home/Hero/Hero';
import IntroStatement from '@/components/home/IntroStatement/IntroStatement';
import ScatterScene from '@/components/home/ScatterScene/ScatterScene';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import PillButton from '@/components/ui/PillButton/PillButton';
import ProjectList from '@/components/work/ProjectList/ProjectList';
import Footer from '@/components/layout/Footer/Footer';
import styles from './page.module.css';

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const projects = getProjects(locale);
  const workHref = localizePath(locale, '/work');

  return (
    <>
      <main>
        <Hero />
        <IntroStatement />
        <section className={styles.selectedWork}>
          <SectionHeader
            title={t.home.selectedWork}
            count={projects.length}
            link={{ label: t.home.viewAll, href: workHref }}
          />
          <ProjectList projects={projects} />
          <div className={styles.more}>
            <PillButton href={workHref} variant="solid" size="lg" count={projects.length} magnetic>
              {t.home.moreWork}
            </PillButton>
          </div>
        </section>
        <ScatterScene projects={projects} />
      </main>
      <Footer />
    </>
  );
}
