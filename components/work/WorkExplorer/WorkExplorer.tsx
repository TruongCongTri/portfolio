'use client';

import { useMemo, useState } from 'react';
import { categoryIds, type CategoryId, type Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import FilterPills, { type FilterOption } from '../FilterPills/FilterPills';
import ViewSwitch, { type ViewMode } from '../ViewSwitch/ViewSwitch';
import ProjectList from '../ProjectList/ProjectList';
import ProjectGrid from '../ProjectGrid/ProjectGrid';
import styles from './WorkExplorer.module.css';

type Filter = CategoryId | 'all';
type LiveFilter = 'all' | 'live';
type GitFilter = 'all' | 'web' | 'api';

type WorkExplorerProps = {
  projects: Project[];
  /** Page heading; defaults to the work page's. */
  title?: string;
};

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function WorkExplorer({ projects, title }: WorkExplorerProps) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<Filter>('all');
  const [liveFilter, setLiveFilter] = useState<LiveFilter>('all');
  const [gitFilter, setGitFilter] = useState<GitFilter>('all');

  // Counts of available links
  const liveCount = useMemo(
    () => projects.filter((p) => Boolean(p.url)).length,
    [projects],
  );
  const webCount = useMemo(
    () => projects.filter((p) => Boolean(p.githubWeb)).length,
    [projects],
  );
  const apiCount = useMemo(
    () => projects.filter((p) => Boolean(p.githubAPI)).length,
    [projects],
  );

  // Filters by category, live availability, and git repository
  const filtered = useMemo(() => {
    let result =
      filter === 'all'
        ? projects
        : projects.filter((p) => p.categories.includes(filter));

    if (liveFilter === 'live') {
      result = result.filter((p) => Boolean(p.url));
    }

    if (gitFilter === 'web') {
      result = result.filter((p) => Boolean(p.githubWeb));
    } else if (gitFilter === 'api') {
      result = result.filter((p) => Boolean(p.githubAPI));
    }

    return result;
  }, [projects, filter, liveFilter, gitFilter]);

  const filterOptions = [
    { value: 'all' as const, label: t.work.all, count: projects.length },
    ...categoryIds
      .map((id) => ({
        value: id,
        label: t.work.categories[id],
        count: projects.filter((p) => p.categories.includes(id)).length,
      }))
      .filter((option) => option.count > 0),
  ];

  const liveFilterOptions: FilterOption<LiveFilter>[] = useMemo(
    () =>
      liveCount > 0
        ? [
            {
              value: 'live' as const,
              label: t.project.viewLive,
              count: liveCount,
              arrow: true,
            },
          ]
        : [],
    [liveCount, t],
  );

  const gitFilterOptions: FilterOption<GitFilter>[] = useMemo(
    () => [
      ...(webCount > 0
        ? [
            {
              value: 'web' as const,
              label: 'Web',
              count: webCount,
              icon: <GitHubIcon />,
            },
          ]
        : []),
      ...(apiCount > 0
        ? [
            {
              value: 'api' as const,
              label: 'API',
              count: apiCount,
              icon: <GitHubIcon />,
            },
          ]
        : []),
    ],
    [webCount, apiCount],
  );

  return (
    <>
      <SplitReveal as="h1" className={styles.title} on="load" delay={0.2}>
        {title ?? t.work.title}
      </SplitReveal>

      <div className={styles.controls}>
        <FilterPills
          options={filterOptions}
          value={filter}
          onChange={setFilter}
          ariaLabel={t.work.filterLabel}
        />

        <div className={styles.trailingControls}>
          <div className={styles.secondaryFilters}>
            {/* View live filter pill */}
            {liveFilterOptions.length > 0 && (
              <FilterPills
                options={liveFilterOptions}
                value={liveFilter}
                onChange={(val) =>
                  setLiveFilter((prev) => (prev === val ? 'all' : val))
                }
                ariaLabel="Filter by live site"
              />
            )}

            {/* Web and API repository filter pills */}
            {gitFilterOptions.length > 0 && (
              <FilterPills
                options={gitFilterOptions}
                value={gitFilter}
                onChange={(val) =>
                  setGitFilter((prev) => (prev === val ? 'all' : val))
                }
                ariaLabel="Filter by source code"
              />
            )}
          </div>

          <ViewSwitch
            value={viewMode}
            onChange={setViewMode}
            ariaLabel={t.work.viewLabel}
            labels={{ list: t.work.list, grid: t.work.grid }}
          />
        </div>
      </div>

      {viewMode === 'list' ? (
        <ProjectList projects={filtered} />
      ) : (
        <ProjectGrid projects={filtered} />
      )}
    </>
  );
}