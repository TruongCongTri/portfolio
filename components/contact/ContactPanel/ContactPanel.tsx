"use client";

import { useEffect, useId, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/lib/i18n/client";
import { sendContactMessage, type ContactMessage } from "@/lib/contact";
import { getGmailComposeUrl } from "@/lib/contactLinks";
import PillButton from "@/components/ui/PillButton/PillButton";
import ContactField from "../ContactField/ContactField";
import styles from "./ContactPanel.module.css";

type Errors = Partial<Record<keyof ContactMessage, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY: ContactMessage = { name: "", email: "", message: "" };

type ContactPanelProps = { open: boolean; onClose: () => void };

export default function ContactPanel({ open, onClose }: ContactPanelProps) {
  const { t: dict } = useI18n();
  const t = dict.contactPanel;
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const timeline = useRef<gsap.core.Timeline>(null);

  const [values, setValues] = useState<ContactMessage>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const mounted = useRef(false);
  const openTimestamp = useRef<number | null>(null);
  const [hpValue, setHpValue] = useState("");

  // Initial panel open/close animation
  useGSAP(
    () => {
      timeline.current = gsap
        .timeline({
          paused: true,
          defaults: { ease: "expo.out" },
          onComplete: () =>
            formRef.current
              ?.querySelector<HTMLElement>("input, textarea")
              ?.focus(),
        })
        .fromTo(
          `.${styles.panel}`,
          {
            autoAlpha: 0,
            clipPath: "inset(100% 0% 0% 0% round 1.25rem)",
            y: 40,
          },
          {
            autoAlpha: 1,
            clipPath: "inset(0% 0% 0% 0% round 1.25rem)",
            y: 0,
            duration: 0.9,
            ease: "expo.inOut",
          },
        )
        .from(
          `.${styles.reveal}`,
          { yPercent: 40, autoAlpha: 0, duration: 0.8, stagger: 0.06 },
          "-=0.35",
        );
    },
    { scope: rootRef },
  );

  // Animate the success state and PillButton when submission completes
  useGSAP(
    () => {
      // Same entrance as the drawer opening: the title and each block rise in, staggered.
      // (Skipped on first mount, where the open timeline owns the entrance.)
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      const targets = sent
        ? [`.${styles.title}`, `.${styles.success} > *`]
        : [`.${styles.title}`, `.${styles.reveal}:not(.${styles.head})`];
      gsap.fromTo(
        targets.flatMap((s) => gsap.utils.toArray<HTMLElement>(s, rootRef.current)),
        { yPercent: 40, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07, ease: "expo.out", overwrite: true },
      );
    },
    { dependencies: [sent], scope: rootRef },
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Element;
      if (
        rootRef.current?.contains(target) ||
        target.closest("[data-contact-trigger]")
      )
        return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      openTimestamp.current = Date.now();
    }
  }, [open]);

  const validate = (v: ContactMessage): Errors => {
    const next: Errors = {};
    if (!v.name.trim()) next.name = t.errors.nameRequired;
    if (!v.email.trim()) next.email = t.errors.emailRequired;
    else if (!EMAIL_PATTERN.test(v.email.trim()))
      next.email = t.errors.emailInvalid;
    if (!v.message.trim()) next.message = t.errors.messageRequired;
    return next;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setServerError(null);
    const found = validate(values);
    setErrors(found);
    const invalid = Object.keys(found);

    if (invalid.length) {
      const fields = invalid
        .map((n) => rootRef.current?.querySelector(`[data-field="${n}"]`))
        .filter(Boolean);
      gsap.fromTo(
        fields,
        { x: 0 },
        {
          keyframes: { x: [-8, 7, -5, 3, 0] },
          duration: 0.45,
          ease: "power1.out",
        },
      );
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${invalid[0]}"]`)
        ?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const elapsed = openTimestamp.current
        ? Date.now() - openTimestamp.current
        : 0;

      const res = await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
        hp: hpValue,
        clientTime: elapsed,
      });

      if (res.success) {
        setSent(true);
      } else {
        setServerError(res.error || "Failed to send message.");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = (name: keyof ContactMessage) => (value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
    if (serverError) setServerError(null);
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setServerError(null);
    setSent(false);
    setHpValue("");
    openTimestamp.current = Date.now();
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
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label={t.close}
          >
            <svg viewBox="0 0 24 24" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className={styles.success}>
            <p className={styles.intro}>{t.successBody}</p>
            <div className={styles.actions}>
              <PillButton
                type="button"
                onClick={reset}
                arrow
                magnetic
              >
                {t.again}
              </PillButton>
            </div>
          </div>
        ) : (
          <>
            <p className={`${styles.intro} ${styles.reveal}`}>{t.intro}</p>
            <form
              ref={formRef}
              className={styles.form}
              onSubmit={onSubmit}
              noValidate
            >
              <ContactField
                className={styles.reveal}
                name="name"
                label={t.name}
                placeholder={t.namePlaceholder}
                value={values.name}
                error={errors.name}
                onChange={update("name")}
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
                onChange={update("email")}
                autoComplete="email"
              />
              <ContactField
                className={styles.reveal}
                name="message"
                label={t.message}
                placeholder={t.messagePlaceholder}
                value={values.message}
                error={errors.message}
                onChange={update("message")}
                multiline
              />

              <div
                style={{
                  position: "absolute",
                  opacity: 0,
                  zIndex: -1,
                  pointerEvents: "none",
                  height: 0,
                  overflow: "hidden",
                }}
              >
                <label htmlFor="hp_company">Company</label>
                <input
                  id="hp_company"
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hpValue}
                  onChange={(e) => setHpValue(e.target.value)}
                />
              </div>

              {serverError && (
                <p className={styles.serverError} role="alert">
                  {serverError}
                </p>
              )}

              <div className={`${styles.actions} ${styles.reveal}`}>
                <PillButton type="submit" arrow magnetic>
                  {isSubmitting ? t.sending : t.submit}
                </PillButton>

                <a
                  href={getGmailComposeUrl(values)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.gmailFallback}
                >
                  {t.openEmail} ↗
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}