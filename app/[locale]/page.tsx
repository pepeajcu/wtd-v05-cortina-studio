import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Hero2 } from '@/components/sections/Hero2';
import { SolutionsSection } from '@/components/sections/SolutionsSection';
import { ReelsSection } from '@/components/sections/ReelsSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { getProyectos } from '@/lib/wordpress/getProyectos';
import { getGeneral } from '@/lib/wordpress/getGeneral';
import { getMediaUrls } from '@/lib/wordpress/getMediaUrls';
import type { ProyectoData } from '@/lib/wordpress/getProyectos';
import { buildMetadata, getBrandDefaults } from '@/lib/seo/metadata';

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const brand = getBrandDefaults();
  return buildMetadata({
    title: brand.defaultTitle,
    description: brand.defaultDescription || 'Expertos en cortinas premium para privacidad, acústica y decoración.',
    path: '/',
    locale: params.locale,
  });
}

function toAttachmentId(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;
  setRequestLocale(locale);

  const [proyectos, general] = await Promise.all([getProyectos(), getGeneral()]);

  // Los reels de la home son TODOS los proyectos publicados: getProyectos ya
  // filtra por status PUBLISH y ordena por fecha (mas reciente primero).
  // No hay seleccion manual en el singleton de Home.
  const mediaIds = proyectos
    .flatMap((p) => [toAttachmentId(p.video), toAttachmentId(p.videoPoster)])
    .filter((n): n is number => n !== null);
  const mediaUrls = await getMediaUrls(mediaIds);

  const resolvedProyectos: ProyectoData[] = proyectos
    .map((p) => {
      const videoId = toAttachmentId(p.video);
      const posterId = toAttachmentId(p.videoPoster);
      return {
        ...p,
        video: videoId !== null ? mediaUrls.get(videoId) ?? '' : p.video,
        videoPoster: posterId !== null ? mediaUrls.get(posterId) ?? null : p.videoPoster,
      };
    })
    // Un proyecto publicado sin video no puede renderizarse como reel.
    .filter((p) => p.video !== '');

  const sinVideo = proyectos.length - resolvedProyectos.length;
  if (sinVideo > 0) {
    console.warn(`[Home] ${sinVideo} proyecto(s) publicado(s) sin video: se omiten del carrusel`);
  }

  return (
    <main>
      <Hero2 whatsappNumber={general.whatsappNumber} />
      <SolutionsSection />
      <ReelsSection
        proyectos={resolvedProyectos}
        whatsappNumber={general.whatsappNumber}
      />
      <ProcessSection whatsappNumber={general.whatsappNumber} />
      <FAQSection whatsappNumber={general.whatsappNumber} />
    </main>
  );
}
