import { localizePath } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import PillButton from '@/components/ui/PillButton/PillButton';
import Reveal from '@/components/ui/Reveal/Reveal';
import styles from './IntroStatement.module.css';

export default async function IntroStatement() {
  const locale = await getLocale();
  const t = getDictionary(locale).home;

  return (
    <section className={styles.intro}>
      <SplitReveal as="p" className={styles.statement}>
        {t.statement}
      </SplitReveal>
      <div className={styles.side}>
        <SplitReveal as="p" className={styles.body} delay={0.15}>
          {t.intro}
        </SplitReveal>
        <Reveal>
          <div>
            <PillButton href={localizePath(locale, '/about')} arrow magnetic>
              {t.aboutMe}
            </PillButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
