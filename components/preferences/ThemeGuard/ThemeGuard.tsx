'use client';

import { useEffect } from 'react';
import { guardTheme } from '@/lib/theme';

/** Keeps <html data-theme> applied for the lifetime of the app. Renders nothing. */
export default function ThemeGuard() {
  useEffect(guardTheme, []);
  return null;
}
