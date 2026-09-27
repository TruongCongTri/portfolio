import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdjacentProjects, getProject, projectSlugs } from '@/lib/projects';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import ProjectColors from '@/components/project/ProjectColors/ProjectColors';
import ProjectHero from '@/components/project/ProjectHero/ProjectHero';
import ProjectOverview from '@/components/project/ProjectOverview/ProjectOverview';
import HorizontalGallery from '@/components/project/HorizontalGallery/HorizontalGallery';
import PrevProjectPrompt from '@/components/project/PrevProjectPrompt/PrevProjectPrompt';
import NextProjectTrigger from '@/components/project/NextProjectTrigger/NextProjectTrigger';

export const dynamicParams = false;

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  return { title: getProject(slug, await getLocale())?.title };
}

// No footer: the page ends by handing off to the next project's hero; pulling up past the top opens the previous one.
export default async function ProjectPage({ params }: PageProps<'/[locale]/work/[slug]'>) {
  const { slug } = await params;
  const locale = await getLocale();
  const project = getProject(slug, locale);
  if (!project) notFound();

  const t = getDictionary(locale).project;
  const { prev, next } = getAdjacentProjects(slug, locale);

  return (
    <main>
      <ProjectColors project={project} />
      <ProjectHero project={project} leading={<PrevProjectPrompt project={prev} />} />
      <ProjectOverview project={project} />
      <HorizontalGallery images={project.images} title={t.galleryTitle} caption={t.galleryCaption} />
      <NextProjectTrigger project={next} />
    </main>
  );
}
