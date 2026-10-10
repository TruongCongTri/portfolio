import localFont from 'next/font/local';

// Self-hosted variable fonts (full glyph sets, incl. Vietnamese) so builds never depend on Google Fonts.
export const sans = localFont({
  variable: '--font-sans',
  src: './PlusJakartaSans-Variable.woff2',
  weight: '200 800',
  display: 'swap',
});

// High-contrast display serif for the marquee, statements and the logo name.
export const serif = localFont({
  variable: '--font-serif',
  src: [
    { path: './Cormorant-Variable.woff2', weight: '300 700', style: 'normal' },
    { path: './Cormorant-Italic-Variable.woff2', weight: '300 700', style: 'italic' },
  ],
  display: 'swap',
});
