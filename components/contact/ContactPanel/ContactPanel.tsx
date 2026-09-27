'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { useI18n } from '@/lib/i18n/client';
import { sendContactMessage, type ContactMessage } from '@/lib/contact';
import PillButton from '@/components/ui/PillButton/PillButton';
import ContactField from '../ContactField/ContactField';
import styles from './ContactPanel.module.css';

type Errors = Partial<Record<keyof ContactMessage, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY: ContactMessage = { name: '', email: '', message: '' };

type ContactPanelProps = { open: boolean; onClose: () => void };

/** Contact form docked to the bottom-right corner. */
export default function ContactPanel({ open, onClose }: ContactPanelProps) {
  const { t: dict } = useI18n();
  const t = dict.contactPanel;
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const timeline = useRef<gsap.core.Timeline>(null);
  const [values, setValues] = useState<ContactMessage>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  // Open/close: the panel wipes up from its bottom edge, then its contents rise in.
  useGSAP(
    () => {
      timeline.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: 'expo.out' },
          // Focus the first field once everything has risen in (hidden fields can't take focus).
          onComplete: () => formRef.current?.querySelector<HTMLElement>('input, textarea')?.focus(),
        })
        .fromTo(
          `.${styles.panel}`,
          { autoAlpha: 0, clipPath: 'inset(100% 0% 0% 0% round 1.25rem)', y: 40 },
          { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0% round 1.25rem)', y: 0, duration: 0.9, ease: 'expo.inOut' },
        )
        .from(`.${styles.reveal}`, { yPercent: 40, autoAlpha: 0, duration: 0.8, stagger: 0.06 }, '-=0.35');
    },
    { scope: rootRef },
  );

  useGSAP(
    () => {
      if (open) {
        timeline.current?.timeScale(1).play();
      } else {
        timeline.current?.timeScale(1.6).reverse();
      }
    },
    { dependencies: [open] },
  );

  // Escape and click-outside close it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Element;
      if (rootRef.current?.contains(target) || target.closest('[data-contact-trigger]')) return;
      onClose();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, onClose]);

  const validate = (v: ContactMessage): Errors => {
    const next: Errors = {};
    if (!v.name.trim()) next.name = t.errors.nameRequired;
    if (!v.email.trim()) next.email = t.errors.emailRequired;
    else if (!EMAIL_PATTERN.test(v.email.trim())) next.email = t.errors.emailInvalid;
    if (!v.message.trim()) next.message = t.errors.messageRequired;
    return next;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const invalid = Object.keys(found);
    if (invalid.length) {
      // Nudge each invalid field so the warnings are noticed.
      const fields = invalid.map((n) => rootRef.current?.querySelector(`[data-field="${n}"]`)).filter(Boolean);
      gsap.fromTo(fields, { x: 0 }, { keyframes: { x: [-8, 7, -5, 3, 0] }, duration: 0.45, ease: 'power1.out' });
      formRef.current?.querySelector<HTMLElement>(`[name="${invalid[0]}"]`)?.focus();
      return;
    }
    await sendContactMessage({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    });
    setSent(true);
  };

  const update = (name: keyof ContactMessage) => (value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    // Clear a field's warning as soon as it's being fixed.
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setSent(false);
  };

  return (
    <div ref={rootRef}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-hidden={!open}
        data-chrome="panel"
      >
        <div className={`${styles.head} ${styles.reveal}`}>
          <h2 id={titleId} className={styles.title}>
            {sent ? t.successTitle : t.title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label={t.close}>
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className={styles.success}>
            <p className={styles.intro}>{t.successBody}</p>
            <PillButton onClick={reset} arrow>
              {t.again}
            </PillButton>
          </div>
        ) : (
          <>
            <p className={`${styles.intro} ${styles.reveal}`}>{t.intro}</p>
            <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate>
              <ContactField
                className={styles.reveal}
                name="name"
                label={t.name}
                placeholder={t.namePlaceholder}
                value={values.name}
                error={errors.name}
                onChange={update('name')}
                autoComplete="name"
              />
              <ContactField
                className={styles.reveal}
                name="email"
                type="email"
                label={t.email}
                placeholder={t.emailPlaceholder}
                value={values.email}
                error={errors.email}
                onChange={update('email')}
                autoComplete="email"
              />
              <ContactField
                className={styles.reveal}
                name="message"
                label={t.message}
                placeholder={t.messagePlaceholder}
                value={values.message}
                error={errors.message}
                onChange={update('message')}
                multiline
              />
              <div className={`${styles.actions} ${styles.reveal}`}>
                <PillButton type="submit" arrow magnetic>
                  {t.submit}
                </PillButton>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
