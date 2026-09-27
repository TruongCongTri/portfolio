'use client';

import { useContact } from '../ContactProvider/ContactProvider';

type ContactTriggerProps = {
  children: React.ReactNode;
  className?: string;
  /** Runs before opening, e.g. to close the side panel. */
  onBeforeOpen?: () => void;
};

/**
 * Button that opens the contact panel. Usable from Server Components (footer) too.
 * Marked with data-contact-trigger so the panel's click-outside handler ignores it.
 */
export default function ContactTrigger({ children, className, onBeforeOpen }: ContactTriggerProps) {
  const { open, isOpen } = useContact();
  return (
    <button
      type="button"
      className={className}
      data-contact-trigger
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      onClick={() => {
        onBeforeOpen?.();
        open();
      }}
    >
      {children}
    </button>
  );
}
