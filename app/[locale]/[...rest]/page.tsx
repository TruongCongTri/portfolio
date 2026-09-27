import { notFound } from 'next/navigation';

// Unmatched paths under a locale render [locale]/not-found.tsx inside the localized layout.
export default function CatchAll() {
  notFound();
}
