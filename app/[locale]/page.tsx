import type { Metadata } from 'next';
import { getLatestProjects, getProjects } from '@/lib/projects';
import { pageMetadata, websiteSchema } from '@/lib/seo';
import { site } from '@/lib/site';
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
import JsonLd from '@/components/seo/JsonLd/JsonLd';
import ProjectLinks from '@/components/seo/ProjectLinks/ProjectLinks';
import styles from './page.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/',
    shareTitle: `${site.name} — ${t.meta.title}`,
    description: t.meta.description,
    type: 'profile',
  });
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  // Fetch both the full list (for the total count) and the 6 latest (for the list view)
  const allProjects = getProjects(locale);
  const latestProjects = getLatestProjects(locale, 6);

  const workHref = localizePath(locale, '/work');

  return (
    <>
      <JsonLd data={websiteSchema(locale, t)} />
      <main>
        {/* The page's one <h1> for search engines and screen readers: the hero's big text is a decorative marquee. */}
        <h1 className="sr-only">
          {site.name} — {t.meta.title}
        </h1>
        <Hero />
        <IntroStatement />
        <section className={styles.selectedWork}>
          <SectionHeader
            title={t.home.selectedWork}
            count={latestProjects.length}
            link={{ label: t.home.viewAll, href: workHref }}
          />
          <ProjectList projects={latestProjects} />
          <ProjectLinks projects={latestProjects} locale={locale} label={t.work.allProjects} />
          <div className={styles.more}>
            <PillButton href={workHref} variant="solid" size="lg" count={allProjects.length} magnetic>
              {t.home.moreWork}
            </PillButton>
          </div>
        </section>
        <ScatterScene projects={latestProjects} />
      </main>
      <Footer />
    </>
  );
}
