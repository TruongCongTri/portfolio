import { getT } from '@/lib/i18n/server';
import { site } from '@/lib/site';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import ParallaxImage from '@/components/ui/ParallaxImage/ParallaxImage';
import styles from './AboutIntro.module.css';

export default async function AboutIntro() {
  const t = (await getT()).about;

  return (
    <section className={styles.intro}>
      <SplitReveal as="h1" className={styles.name} split="chars" on="load" stagger={0.03} delay={0.2}>
        {site.name}
      </SplitReveal>

      {/* Two columns, each a text block over a picture. The left picture stretches to fill whatever
          height the (longer) right-hand text leaves, so both columns end on the same line. */}
      <div className={styles.body}>
        <div className={styles.column}>
          <SplitReveal as="p" className={styles.lead} on="load" delay={0.5}>
            {t.lead}
          </SplitReveal>
          <ParallaxImage
            src={site.portrait.src}
            alt={site.name}
            className={`${styles.media} ${styles.portrait}`}
            sizes="(min-width: 900px) 50vw, 100vw"
            position="50% 100%"
            fit="contain"
            strength={0}
          />
        </div>

        <div className={`${styles.column} ${styles.side}`}>
          <div className={styles.paragraphs}>
            {t.side.map((paragraph, i) => (
              <SplitReveal key={i} as="p" on="load" delay={0.7 + i * 0.12}>
                {paragraph}
              </SplitReveal>
            ))}
          </div>
          <ParallaxImage
            src="/portrait-02.jpg"
            alt={t.imageAlt}
            className={`${styles.media} ${styles.landscape}`}
            sizes="(min-width: 900px) 40vw, 100vw"
            position="50% 38%"
            strength={0}
          />
        </div>
      </div>
    </section>
  );
}
