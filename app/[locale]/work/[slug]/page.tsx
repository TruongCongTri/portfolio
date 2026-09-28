import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdjacentProjects, getProject, imageUrl, projectSlugs } from '@/lib/projects';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { pageMetadata, projectSchema } from '@/lib/seo';
import { site } from '@/lib/site';
import JsonLd from '@/components/seo/JsonLd/JsonLd';
import ProjectColors from '@/components/project/ProjectColors/ProjectColors';
import ProjectHero from '@/components/project/ProjectHero/ProjectHero';
import ProjectOverview from '@/components/project/ProjectOverview/ProjectOverview';
import HorizontalGallery from '@/components/project/HorizontalGallery/HorizontalGallery';
import PrevProjectTrigger from '@/components/project/PrevProjectTrigger/PrevProjectTrigger';
import NextProjectTrigger from '@/components/project/NextProjectTrigger/NextProjectTrigger';

// Known projects are prerendered; an unknown slug still runs the page, whose notFound() renders
// this segment's not-found.tsx (with `false`, Next would answer with a generic 404 instead).
export const dynamicParams = true;

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const project = getProject(slug, locale);
  if (!project) return {}; // not-found.tsx supplies its own metadata
  return pageMetadata({
    locale,
    path: `/work/${slug}`,
    title: project.title,
    shareTitle: `${project.title} — ${site.name}`,
    description: project.overview,
    type: 'article',
    images: [
      {
        url: imageUrl(project.images[0]),
        // Real dimensions for imported screenshots; the remote placeholders are 1600×1000.
        width: typeof project.images[0] === 'string' ? 1600 : project.images[0].width,
        height: typeof project.images[0] === 'string' ? 1000 : project.images[0].height,
        alt: project.title,
      },
    ],
  });
}

// No footer: the page ends by handing off to the next project's hero; pulling up past the top brings the previous project's hero down over it.
export default async function ProjectPage({ params }: PageProps<'/[locale]/work/[slug]'>) {
  const { slug } = await params;
  const locale = await getLocale();
  const project = getProject(slug, locale);
  if (!project) notFound();

  const dictionary = getDictionary(locale);
  const t = dictionary.project;
  const { prev, next } = getAdjacentProjects(slug, locale);

  return (
    <main>
      <JsonLd data={projectSchema(locale, dictionary, project)} />
      <ProjectColors project={project} />
      <PrevProjectTrigger project={prev} pageColor={project.color} />
      <ProjectHero project={project} />
      <ProjectOverview project={project} />
      <HorizontalGallery images={project.images} title={t.galleryTitle} caption={t.galleryCaption} />
      <NextProjectTrigger project={next} pageColor={project.color} />
    </main>
  );
}
