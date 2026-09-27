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

      <div className={styles.body}>
        <SplitReveal as="p" className={styles.lead} on="load" delay={0.5}>
          {t.lead}
        </SplitReveal>
        <div className={styles.side}>
          {t.side.map((paragraph, i) => (
            <SplitReveal key={i} as="p" on="load" delay={0.7 + i * 0.12}>
              {paragraph}
            </SplitReveal>
          ))}
        </div>
      </div>

      <ParallaxImage
        src="https://placehold.co/1800x1000/d9d9d9/8a8a8a/png?text=Workspace&font=montserrat"
        alt={t.imageAlt}
        className={styles.image}
      />
    </section>
  );
}
