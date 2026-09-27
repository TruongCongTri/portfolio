import type { Metadata } from 'next';
import { getT } from '@/lib/i18n/server';
import AboutIntro from '@/components/about/AboutIntro/AboutIntro';
import Services from '@/components/about/Services/Services';
import Footer from '@/components/layout/Footer/Footer';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).nav.about };
}

export default function AboutPage() {
  return (
    <>
      <main>
        <AboutIntro />
        <Services />
      </main>
      <Footer />
    </>
  );
}
