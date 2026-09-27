import type { Metadata } from 'next';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { getLocale } from '@/lib/i18n/server';
import { pageMetadata, profilePageSchema } from '@/lib/seo';
import { site } from '@/lib/site';
import AboutIntro from '@/components/about/AboutIntro/AboutIntro';
import Services from '@/components/about/Services/Services';
import Footer from '@/components/layout/Footer/Footer';
import JsonLd from '@/components/seo/JsonLd/JsonLd';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return pageMetadata({
    locale,
    path: '/about',
    title: t.nav.about,
    shareTitle: `${t.nav.about} — ${site.name}`,
    description: t.about.lead,
    type: 'profile',
  });
}

export default async function AboutPage() {
  const locale = await getLocale();
  return (
    <>
      <JsonLd data={profilePageSchema(locale, getDictionary(locale))} />
      <main>
        <AboutIntro />
        <Services />
      </main>
      <Footer />
    </>
  );
}
