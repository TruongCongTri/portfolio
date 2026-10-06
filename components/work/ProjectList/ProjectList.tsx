"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, PLAY_ONCE, useGSAP } from "@/lib/gsap";
import type { Project } from "@/lib/projects";
import { useI18n } from "@/lib/i18n/client";
import HoverPreview from "@/components/ui/HoverPreview/HoverPreview";
import PillButton from "@/components/ui/PillButton/PillButton";
import GitButton from "@/components/ui/GithubButton/GitButton";
import styles from "./ProjectList.module.css";

type ProjectListProps = {
  projects: Project[];
  /** Show the project's cover image trailing the cursor on hover. */
  withPreview?: boolean;
};

export default function ProjectList({
  projects,
  withPreview = true,
}: ProjectListProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<Project | null>(null);
  const { t, href } = useI18n();
  const columns = t.home.columns;

  useGSAP(
    () => {
      // Rules draw in left to right, then each row's content rises.
      gsap.utils
        .toArray<HTMLElement>(`.${styles.row}, .${styles.head}`)
        .forEach((row) => {
          gsap
            .timeline({
              scrollTrigger: { trigger: row, start: "top 92%", ...PLAY_ONCE },
            })
            .from(row.querySelector(`.${styles.rule}`), {
              scaleX: 0,
              duration: 1.4,
              ease: "expo.inOut",
            })
            .from(
              row.querySelectorAll(`.${styles.cell}`),
              {
                yPercent: 60,
                autoAlpha: 0,
                duration: 1,
                ease: "expo.out",
                stagger: 0.05,
              },
              0.2,
            );
        });
    },
    { scope: ref, dependencies: [projects], revertOnUpdate: true },
  );

  return (
    <div ref={ref} className={styles.list}>
      {withPreview && (
        <HoverPreview src={preview?.images[0] ?? null} color={preview?.color} />
      )}

      {/* Table Head: Columns 1-3 align left, Year aligns right */}
      <div className={`${styles.head} ${styles.grid}`} aria-hidden>
        <span className={styles.cell}>{columns.client}</span>
        <span className={styles.cell}>{columns.category}</span>
        <span className={`${styles.cell} ${styles.services}`}>
          {columns.services}
        </span>
        <span className={`${styles.cell} ${styles.year}`}>{columns.year}</span>
        <span className={styles.rule} />
      </div>

      {projects.map((project) => {
        const hasGit = Boolean(project.githubWeb || project.githubAPI);

        return (
          <div
            key={project.slug}
            className={`${styles.row} ${styles.grid}`}
            onMouseEnter={withPreview ? () => setPreview(project) : undefined}
            onMouseLeave={withPreview ? () => setPreview(null) : undefined}
          >
            <Link
              href={href(`/work/${project.slug}`)}
              className={styles.rowLink}
              aria-label={project.title}
            />

            {/* Column 1: Client / Title */}
            <span className={`${styles.cell} ${styles.title}`}>
              <span className={styles.titleText}>{project.title}</span>
            </span>

            {/* Column 2: Category (multi-line breakdown) */}
            <span className={`${styles.cell} ${styles.category}`}>
              {project.categories.map((catId) => (
                <span key={catId} className={styles.categoryLine}>
                  {t.work.categories[catId]}
                </span>
              ))}
            </span>

            {/* Column 3: Services */}
            <span className={`${styles.cell} ${styles.services}`}>
              {project.services}
            </span>

            {/* Column 4: Actions & Year (align right) */}
            <span className={`${styles.cell} ${styles.year}`}>
              <span className={styles.actions}>
                {/* Git column (Web above API) */}
                {hasGit && (
                  <span className={styles.gitCol}>
                    {project.githubWeb && (
                      <GitButton
                        href={project.githubWeb}
                        variant="solid"
                        magnetic
                        ariaLabel={`Web source code: ${project.title}`}
                      >
                        Web
                      </GitButton>
                    )}
                    {project.githubAPI && (
                      <GitButton
                        href={project.githubAPI}
                        variant="solid"
                        magnetic
                        ariaLabel={`API source code: ${project.title}`}
                      >
                        API
                      </GitButton>
                    )}
                  </span>
                )}

                {/* Live Link Button or Reserved Space */}
                {project.url ? (
                  <span className={styles.live}>
                    <PillButton
                      href={project.url}
                      external
                      size="icon"
                      arrow
                      magnetic
                      ariaLabel={`${t.project.visit}: ${project.title}`}
                      title={t.project.viewLive}
                    />
                  </span>
                ) : (
                  <span className={styles.livePlaceholder} aria-hidden="true" />
                )}
              </span>

              <span className={styles.yearText}>{project.year}</span>
            </span>

            <span className={styles.rule} />
          </div>
        );
      })}
    </div>
  );
}