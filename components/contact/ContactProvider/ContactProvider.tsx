'use client';

import { createContext, use, useCallback, useMemo, useState } from 'react';
import ContactPanel from '../ContactPanel/ContactPanel';

type ContactContextValue = { isOpen: boolean; open: () => void; close: () => void; toggle: () => void };

const ContactContext = createContext<ContactContextValue | null>(null);

/** Owns the contact panel's open state and renders the panel once for the whole app. */
export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(() => ({ isOpen, open, close, toggle }), [isOpen, open, close, toggle]);

  return (
    <ContactContext value={value}>
      {children}
      <ContactPanel open={isOpen} onClose={close} />
    </ContactContext>
  );
}

export function useContact() {
  const context = use(ContactContext);
  if (!context) throw new Error('useContact must be used inside <ContactProvider>');
  return context;
}
