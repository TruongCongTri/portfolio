import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdjacentHiddenProjects, getHiddenProject, hiddenProjectSlugs } from '@/lib/hiddenProjects';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import ProjectColors from '@/components/project/ProjectColors/ProjectColors';
import ProjectHero from '@/components/project/ProjectHero/ProjectHero';
import ProjectOverview from '@/components/project/ProjectOverview/ProjectOverview';
import HorizontalGallery from '@/components/project/HorizontalGallery/HorizontalGallery';
import PrevProjectTrigger from '@/components/project/PrevProjectTrigger/PrevProjectTrigger';
import NextProjectTrigger from '@/components/project/NextProjectTrigger/NextProjectTrigger';
import Footer from '@/components/layout/Footer/Footer';

/*
 * A hidden project's detail page: /work/[slug] minus the SEO (no JSON-LD, share card or indexing).
 * Visitors reach it at /work/<slug>, which proxy.ts rewrites here for browsers holding the access
 * cookie; without it, both URLs are the ordinary 404 (see lib/privateAccess).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return hiddenProjectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/work/private/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const project = getHiddenProject(slug, await getLocale());
  if (!project) return {};
  return { title: project.title, robots: { index: false, follow: false, nocache: true } };
}

export default async function HiddenProjectPage({ params }: PageProps<'/[locale]/work/private/[slug]'>) {
  const { slug } = await params;
  const locale = await getLocale();
  const project = getHiddenProject(slug, locale);
  if (!project) notFound();

  const t = getDictionary(locale).project;
  // Only other hidden projects, so the hand-off never leads back to public work.
  const adjacent = getAdjacentHiddenProjects(slug, locale);

  return (
    <>
      <main>
        <ProjectColors project={project} />
        {adjacent && <PrevProjectTrigger project={adjacent.prev} pageColor={project.color} />}
        <ProjectHero project={project} />
        <ProjectOverview project={project} />
        <HorizontalGallery images={project.images} title={t.galleryTitle} caption={t.galleryCaption} />
        {adjacent && <NextProjectTrigger project={adjacent.next} pageColor={project.color} />}
      </main>
      {!adjacent && <Footer />}
    </>
  );
}
