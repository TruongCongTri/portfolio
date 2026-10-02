'use client';

import { useMemo, useState } from 'react';
import { categoryIds, type CategoryId, type Project } from '@/lib/projects';
import { useI18n } from '@/lib/i18n/client';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import FilterPills from '../FilterPills/FilterPills';
import ViewSwitch, { type ViewMode } from '../ViewSwitch/ViewSwitch';
import ProjectList from '../ProjectList/ProjectList';
import ProjectGrid from '../ProjectGrid/ProjectGrid';
import styles from './WorkExplorer.module.css';

type Filter = CategoryId | 'all';

type WorkExplorerProps = {
  projects: Project[];
  /** Page heading; defaults to the work page's. */
  title?: string;
};

export default function WorkExplorer({ projects, title }: WorkExplorerProps) {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<Filter>('all');

  // Stable reference so list/grid animations only replay when the filter actually changes.
  const filtered = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.categories.includes(filter))),
    [projects, filter],
  );

  const filterOptions = [
    { value: 'all' as const, label: t.work.all, count: projects.length },
    ...categoryIds
      .map((id) => ({
        value: id,
        label: t.work.categories[id],
        count: projects.filter((p) => p.categories.includes(id)).length,
      }))
      // Only categories this list has (e.g. the archive's few projects).
      .filter((option) => option.count > 0),
  ];

  return (
    <>
      <SplitReveal as="h1" className={styles.title} on="load" delay={0.2}>
        {title ?? t.work.title}
      </SplitReveal>

      <div className={styles.controls}>
        <FilterPills options={filterOptions} value={filter} onChange={setFilter} ariaLabel={t.work.filterLabel} />
        <ViewSwitch
          value={viewMode}
          onChange={setViewMode}
          ariaLabel={t.work.viewLabel}
          labels={{ list: t.work.list, grid: t.work.grid }}
        />
      </div>

      {viewMode === 'list' ? <ProjectList projects={filtered} /> : <ProjectGrid projects={filtered} />}
    </>
  );
}
