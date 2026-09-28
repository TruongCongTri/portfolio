import type { Project } from '@/lib/projects';
import { getT } from '@/lib/i18n/server';
import MetaBar from '@/components/ui/MetaBar/MetaBar';
import PillButton from '@/components/ui/PillButton/PillButton';
import Reveal from '@/components/ui/Reveal/Reveal';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import styles from './ProjectOverview.module.css';

/**
 * Sits right under the hero cover and spans the same width: a labelled rule, then the headline
 * (+ live link) on the left and Challenge / Approach on the right.
 */
export default async function ProjectOverview({ project }: { project: Project }) {
  const t = (await getT()).project;

  return (
    <section className={styles.overview} data-project-section>
      <MetaBar start={project.title} center={t.overviewTag} columns />

      <div className={styles.grid}>
        <div className={styles.intro}>
          <div className={styles.titleGroup}>
            <SplitReveal as="h2" className={styles.headline}>
              {project.title}
            </SplitReveal>
            <SplitReveal as="p" className={styles.summary} delay={0.1}>
              {project.overview}
            </SplitReveal>
          </div>
          {project.url && (
            <Reveal>
              <div>
                <PillButton href={project.url} external arrow magnetic>
                  {t.viewLive}
                </PillButton>
              </div>
            </Reveal>
          )}
        </div>

        <div className={styles.details}>
          <div className={styles.block}>
            <SplitReveal as="h3" className={styles.heading} split="words">
              {t.challenge}
            </SplitReveal>
            {project.challenge.map((paragraph, i) => (
              <SplitReveal key={i} as="p" className={styles.text} delay={0.1}>
                {paragraph}
              </SplitReveal>
            ))}
          </div>
          <div className={styles.block}>
            <SplitReveal as="h3" className={styles.heading} split="words">
              {t.approach}
            </SplitReveal>
            {project.approach.map((paragraph, i) => (
              <SplitReveal key={i} as="p" className={styles.text} delay={0.1}>
                {paragraph}
              </SplitReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
