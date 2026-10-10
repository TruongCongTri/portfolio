import Link from 'next/link';
import { localizePath } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import type { Project } from '@/lib/projects';

/**
 * Plain links to every project, in the server-rendered HTML, hidden from sight (not from screen readers).
 * The visible lists load a few projects at a time as you scroll, so without this a crawler (or a visitor
 * without JavaScript) would only ever find the first batch.
 */
export default function ProjectLinks({ projects, locale, label }: { projects: Project[]; locale: Locale; label: string }) {
  return (
    <nav aria-label={label} className="sr-only">
      <ul>
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={localizePath(locale, `/work/${project.slug}`)}>
              {project.title} — {project.overview}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
