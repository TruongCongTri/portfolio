import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import styles from './ErrorScreen.module.css';

type ErrorScreenProps = {
  /** Large display label, e.g. "404" or "Error". */
  code: string;
  title: string;
  body: string;
  /** Buttons/links under the text. */
  actions?: React.ReactNode;
  /** Extra content below the actions (e.g. a list of projects). */
  children?: React.ReactNode;
  /** Small print at the bottom (e.g. an error reference). */
  footnote?: React.ReactNode;
};

/** Shared layout for the 404 and error pages, in the site's typographic style. */
export default function ErrorScreen({ code, title, body, actions, children, footnote }: ErrorScreenProps) {
  return (
    <main className={styles.screen}>
      <SplitReveal as="p" className={styles.code} split="chars" on="load" stagger={0.05} delay={0.1}>
        {code}
      </SplitReveal>
      <div className={styles.content}>
        <SplitReveal as="h1" className={styles.title} on="load" delay={0.35}>
          {title}
        </SplitReveal>
        <SplitReveal as="p" className={styles.body} on="load" delay={0.5}>
          {body}
        </SplitReveal>
        {actions && <div className={styles.actions}>{actions}</div>}
        {children}
        {footnote && <p className={styles.footnote}>{footnote}</p>}
      </div>
    </main>
  );
}
