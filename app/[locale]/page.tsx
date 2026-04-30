import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { ProblemsSection } from '@/components/sections/ProblemsSection';
import { ReelsSection } from '@/components/sections/ReelsSection';
import { ProcessSection } from '@/components/sections/ProcessSection';

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;
  setRequestLocale(locale);

  return (
    <main>
      <Hero />
      <ProblemsSection />
      <ReelsSection />
      <ProcessSection />
      {/* Otras secciones se añadirán aquí */}
    </main>
  );
}
