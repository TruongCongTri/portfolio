import Link from 'next/link';
import SplitReveal from '@/components/ui/SplitReveal/SplitReveal';
import styles from './SectionHeader.module.css';

type SectionHeaderProps = {
  title: string;
  /** Muted "( n )" after the title. */
  count?: number;
  link?: { label: string; href: string };
};

/** Section title row with an optional count and a right-aligned link. */
export default function SectionHeader({ title, count, link }: SectionHeaderProps) {
  return (
    <div className={styles.header}>
      <SplitReveal as="h2" className={styles.title} split="words">
        {title}
        {count !== undefined && <span className={styles.count}> ( {count} )</span>}
      </SplitReveal>
      {link && (
        <Link href={link.href} className={styles.link}>
          {link.label}
        </Link>
      )}
    </div>
  );
}
