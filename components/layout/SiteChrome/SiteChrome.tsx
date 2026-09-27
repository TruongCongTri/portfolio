'use client';

import { useEffect, useState } from 'react';
import Header from '../Header/Header';
import MenuButton from '../MenuButton/MenuButton';
import SidePanel from '../SidePanel/SidePanel';

const SCROLL_THRESHOLD = 80;

/** Fixed navigation layer: header while at the top, floating menu button once scrolled. */
export default function SiteChrome() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <Header hidden={scrolled} />
      <MenuButton
        open={menuOpen}
        visible={scrolled || menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      />
      <SidePanel open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
