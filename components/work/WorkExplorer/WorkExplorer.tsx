'use client';

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { categoryIds, type CategoryId, type Project } from '@/lib/projects';
import { useIsMobile } from '@/lib/useIsMobile';
import { chooseView, parseView, toggleQuery, updateQuery, useQueryParams, useStoredView } from '@/lib/workQuery';
import { gsap, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import FilterPills, { ClearPill, type FilterOption } from '../FilterPills/FilterPills';
import CollapsibleFilterPills from '../FilterPills/CollapsibleFilterPills';
import ViewSwitch, { type ViewMode } from '../ViewSwitch/ViewSwitch';
import ProjectList from '../ProjectList/ProjectList';
import ProjectGrid from '../ProjectGrid/ProjectGrid';
import styles from './WorkExplorer.module.css';

type Filter = CategoryId | 'all';
type LiveFilter = 'all' | 'live';
type GitFilter = 'all' | 'web' | 'api';
type MobileDrawer = 'none' | 'category' | 'links';

const EMPTY: Project[] = [];

type WorkExplorerProps = {
  projects: Project[];
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

function CategoryIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function LinkChainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="0.8em"
      height="0.8em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function WorkExplorer({ projects, title }: WorkExplorerProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();
  const controlsRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // The bar is pinned once the marker above it has scrolled off the top of the screen.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) =>
      setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
  const [mobileDrawer, setMobileDrawer] = useState<MobileDrawer>('none');
  const mobileClearRef = useRef<HTMLButtonElement>(null);
  // The page's intro (pills rising in one by one) lasts about a second; a Clear button that appears later skips its wait
  const [introDone, setIntroDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // The URL is the source of truth: ?category=…&live=true&git=web|api&view=list|grid. Everything below
  // is derived from it, so back/forward, shared links and refreshes restore the same state.
  const params = useQueryParams();
  const storedView = useStoredView();
  const categoryParam = params.get('category');
  const filter: Filter = categoryIds.includes(categoryParam as CategoryId) ? (categoryParam as CategoryId) : 'all';
  const liveFilter: LiveFilter = params.get('live') === 'true' ? 'live' : 'all';
  const gitParam = params.get('git');
  const gitFilter: GitFilter = gitParam === 'web' || gitParam === 'api' ? gitParam : 'all';
  // Layout: the URL wins, then the one remembered in this browser, then the grid
  const hasViewParam = params.has('view');
  const viewMode: ViewMode = parseView(params.get('view')) ?? storedView ?? 'grid';

  // Stable handlers (they read the URL themselves), so the memoised pill groups below don't re-render
  const setFilter = useCallback((value: Filter) => updateQuery({ category: value === 'all' ? null : value }), []);
  const toggleLive = useCallback(() => toggleQuery('live', 'true'), []);
  const toggleGit = useCallback((value: GitFilter) => toggleQuery('git', value), []);
  const pickMobileCategory = useCallback(
    (value: Filter) => {
      setFilter(value);
      setMobileDrawer('none');
    },
    [setFilter],
  );

  // Arriving without ?view= but with a remembered layout: show it in the URL too
  useEffect(() => {
    if (storedView && !hasViewParam) updateQuery({ view: storedView });
  }, [storedView, hasViewParam]);

  // Close mobile drawer on outside click
  useEffect(() => {
    if (mobileDrawer === 'none') return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!controlsRef.current?.contains(e.target as Node)) {
        setMobileDrawer('none');
      }
    };
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [mobileDrawer]);

  // Everything the filters need, computed in a single pass and only when the data changes: per-category
  // lists (so a category filter is a lookup, not a scan) and the counts shown on the pills.
  const facets = useMemo(() => {
    const byCategory = new Map<CategoryId, Project[]>();
    let liveCount = 0;
    let webCount = 0;
    let apiCount = 0;
    for (const project of projects) {
      for (const id of project.categories) {
        const list = byCategory.get(id);
        if (list) list.push(project);
        else byCategory.set(id, [project]);
      }
      if (project.url) liveCount += 1;
      if (project.githubWeb) webCount += 1;
      if (project.githubAPI) apiCount += 1;
    }
    return { byCategory, liveCount, webCount, apiCount };
  }, [projects]);
  const { liveCount, webCount, apiCount } = facets;

  const hasSecondaryFilters = liveCount > 0 || webCount > 0 || apiCount > 0;
  const isAnyFilterActive =
    filter !== 'all' || liveFilter !== 'all' || gitFilter !== 'all';

  const resetAllFilters = useCallback(() => {
    updateQuery({ category: null, live: null, git: null });
    setMobileDrawer('none');
  }, []);

  // Filtering is treated like a request to a server: the controls answer at once (they read the URL), while
  // the list renders from *deferred* criteria. React keeps showing the previous results, interruptibly,
  // until the new ones are ready, and `isPending` says so (see the dimmed results below).
  const criteria = useMemo(() => ({ filter, live: liveFilter, git: gitFilter, view: viewMode }), [filter, liveFilter, gitFilter, viewMode]);
  const deferred = useDeferredValue(criteria);
  const isPending = deferred !== criteria;

  const filtered = useMemo(() => {
    let result = deferred.filter === 'all' ? projects : (facets.byCategory.get(deferred.filter) ?? EMPTY);
    if (deferred.live === 'live') result = result.filter((p) => Boolean(p.url));
    if (deferred.git === 'web') result = result.filter((p) => Boolean(p.githubWeb));
    else if (deferred.git === 'api') result = result.filter((p) => Boolean(p.githubAPI));
    return result; // unfiltered: the very same array as `projects`, so the list below doesn't re-render
  }, [projects, facets, deferred.filter, deferred.live, deferred.git]);

  const filterOptions = useMemo(
    () => [
      { value: 'all' as const, label: t.work.all, count: projects.length },
      ...categoryIds
        .map((id) => ({ value: id, label: t.work.categories[id], count: facets.byCategory.get(id)?.length ?? 0 }))
        .filter((option) => option.count > 0),
    ],
    [projects.length, facets, t],
  );
  const viewLabels = useMemo(() => ({ list: t.work.list, grid: t.work.grid }), [t]);

  const liveFilterOptions: FilterOption<LiveFilter>[] = useMemo(
    () =>
      liveCount > 0
        ? [
            {
              value: 'live' as const,
              label: 'Live',
              count: liveCount,
              arrow: true,
            },
          ]
        : [],
    [liveCount],
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

  // Dynamic mobile button labels reflecting active filter choices
  const categoryBtnLabel = useMemo(() => {
    if (filter === 'all') return t.work.all;
    return t.work.categories[filter] || filter;
  }, [filter, t]);

  const linksBtnLabel = useMemo(() => {
    const parts: string[] = [];
    if (liveFilter === 'live') parts.push('Live');
    if (gitFilter === 'web') parts.push('Web');
    if (gitFilter === 'api') parts.push('API');
    return parts.length > 0 ? parts.join(' / ') : 'Links';
  }, [liveFilter, gitFilter]);

  // The mobile Clear button rises in when a filter turns on (the desktop one animates itself)
  useGSAP(
    () => {
      if (!isAnyFilterActive || !mobileClearRef.current) return;
      gsap.from(mobileClearRef.current, { y: 20, autoAlpha: 0, duration: 0.9, ease: 'expo.out' });
    },
    { dependencies: [isAnyFilterActive] },
  );

  const isCategoryActive = filter !== 'all';
  const isLinksActive = liveFilter !== 'all' || gitFilter !== 'all';

  return (
    <>
      <SplitReveal as="h1" className={styles.title} on="load" delay={0.2}>
        {title ?? t.work.title}
      </SplitReveal>

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden />
      <div ref={controlsRef} className={styles.controls} data-stuck={stuck}>
        {/* ==============================================================
            1. DESKTOP & TABLET CONTROLS (>= 768px)
            ============================================================== */}
        <div className={styles.desktopControls}>
          <div className={styles.primaryBar}>
            <div className={styles.categories}>
              <CollapsibleFilterPills
                options={filterOptions}
                value={filter}
                onChange={setFilter}
                ariaLabel={t.work.filterLabel}
                moreLabel={t.work.moreCategories}
                lessLabel={t.work.fewerCategories}
              />
            </div>

            <div className={styles.viewSwitchWrap}>
              <ViewSwitch
                value={viewMode}
                onChange={chooseView}
                ariaLabel={t.work.viewLabel}
                labels={viewLabels}
              />
            </div>
          </div>

          {hasSecondaryFilters && (
            <div className={styles.secondaryBar}>
              <div className={styles.secondaryFilters}>
                {liveFilterOptions.length > 0 && (
                  <FilterPills
                    options={liveFilterOptions}
                    value={liveFilter}
                    onChange={toggleLive}
                    ariaLabel="Filter by live site"
                  />
                )}

                {gitFilterOptions.length > 0 && (
                  <FilterPills
                    options={gitFilterOptions}
                    value={gitFilter}
                    onChange={toggleGit}
                    ariaLabel="Filter by source code"
                  />
                )}

                {isAnyFilterActive && (
                  <ClearPill label={t.work.clear} onClick={resetAllFilters} ariaLabel={t.work.clearAll} delay={introDone ? 0 : 1.1} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==============================================================
            2. MOBILE CONTROLS (< 768px)
            2 Icon Filter Trigger Pills (Category & Links); no ViewSwitch — mobile is always grid
            ============================================================== */}
        <div className={styles.mobileControls}>
          <div className={styles.mobileBar}>
            <div className={styles.mobileTriggers}>
              {/* Category Filter Trigger Button */}
              <button
                type="button"
                className={`${styles.filterPillTrigger} ${
                  isCategoryActive ? styles.triggerActive : ''
                } ${mobileDrawer === 'category' ? styles.triggerOpen : ''}`}
                onClick={() =>
                  setMobileDrawer((prev) =>
                    prev === 'category' ? 'none' : 'category',
                  )
                }
                aria-expanded={mobileDrawer === 'category'}
                aria-label="Filter by category"
              >
                <span className={styles.triggerIcon}>
                  <CategoryIcon />
                </span>
                <span className={styles.triggerLabel}>{categoryBtnLabel}</span>
                <ChevronIcon open={mobileDrawer === 'category'} />
              </button>

              {/* Links & Repositories Filter Trigger Button */}
              <button
                type="button"
                className={`${styles.filterPillTrigger} ${
                  isLinksActive ? styles.triggerActive : ''
                } ${mobileDrawer === 'links' ? styles.triggerOpen : ''}`}
                onClick={() =>
                  setMobileDrawer((prev) => (prev === 'links' ? 'none' : 'links'))
                }
                aria-expanded={mobileDrawer === 'links'}
                aria-label="Filter by links and repositories"
              >
                <span className={styles.triggerIcon}>
                  <LinkChainIcon />
                </span>
                <span className={styles.triggerLabel}>{linksBtnLabel}</span>
                <ChevronIcon open={mobileDrawer === 'links'} />
              </button>

              {/* Clear: same pill as the two triggers, icon-only so all three fit one row; only while a filter is on */}
              {isAnyFilterActive && (
                <button
                  ref={mobileClearRef}
                  type="button"
                  className={`${styles.filterPillTrigger} ${styles.clearTrigger}`}
                  onClick={resetAllFilters}
                  aria-label={t.work.clearAll}
                >
                  <span className={styles.triggerIcon}>
                    <CloseIcon />
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Expandable Mobile Filter Tray */}
          {mobileDrawer !== 'none' && (
            <div className={styles.mobileDrawerPanel}>
              {mobileDrawer === 'category' && (
                <div className={styles.drawerSection}>
                  <FilterPills
                    options={filterOptions}
                    value={filter}
                    onChange={pickMobileCategory}
                    ariaLabel={t.work.filterLabel}
                    delay={0}
                  />
                </div>
              )}

              {mobileDrawer === 'links' && (
                <div className={styles.drawerSection}>
                  <div className={styles.secondaryFilters}>
                    {liveFilterOptions.length > 0 && (
                      <FilterPills
                        options={liveFilterOptions}
                        value={liveFilter}
                        onChange={toggleLive}
                        ariaLabel="Filter by live site"
                        delay={0}
                      />
                    )}

                    {gitFilterOptions.length > 0 && (
                      <FilterPills
                        options={gitFilterOptions}
                        value={gitFilter}
                        onChange={toggleGit}
                        ariaLabel="Filter by source code"
                        delay={0}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Results: dimmed while the (deferred) list catches up with the filters */}
      <div className={styles.results} data-pending={isPending} aria-busy={isPending}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No projects match the selected filters.</p>
            <button type="button" onClick={resetAllFilters} className={styles.emptyResetBtn}>
              Reset all filters
            </button>
          </div>
        ) : deferred.view === 'list' && !isMobile ? (
          <ProjectList projects={filtered} />
        ) : (
          <ProjectGrid projects={filtered} />
        )}
      </div>
    </>
  );
}
