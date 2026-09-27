import { getT } from '@/lib/i18n/server';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import TypingDots from '@/components/ui/TypingDots/TypingDots';
import ServiceCard from './ServiceCard';
import ServicesGrid from './ServicesGrid';
import styles from './Services.module.css';

/** Dark band (in both themes) listing what's on offer. */
export default async function Services() {
  const t = (await getT()).about;

  return (
    <section className={styles.services}>
      <div className={styles.heading}>
        <SplitReveal as="h2" className={styles.title} split="words">
          {t.helpWith}
        </SplitReveal>
        <TypingDots />
      </div>

      <ServicesGrid>
        {t.services.map((service, i) => (
          <ServiceCard
            key={service.title}
            index={i}
            title={service.title}
            description={service.description}
            highlight={i === t.services.length - 1}
          />
        ))}
      </ServicesGrid>
    </section>
  );
}
