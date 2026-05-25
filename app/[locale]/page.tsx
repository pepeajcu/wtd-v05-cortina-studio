import { setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/sections/Hero';
import { ProblemsSection } from '@/components/sections/ProblemsSection';
import { ReelsSection } from '@/components/sections/ReelsSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { getHome } from '@/lib/wordpress/getHome';
import { getProyectos } from '@/lib/wordpress/getProyectos';
import { getGeneral } from '@/lib/wordpress/getGeneral';
import { getMediaUrls } from '@/lib/wordpress/getMediaUrls';
import type { ProyectoData } from '@/lib/wordpress/getProyectos';

function toAttachmentId(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export default async function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;
  setRequestLocale(locale);

  const [home, proyectos, general] = await Promise.all([
    getHome(),
    getProyectos(),
    getGeneral(),
  ]);

  const selectedIds = home.reels.selected
    .map((s) => Number(s.id))
    .filter((n) => Number.isFinite(n));
  const proyectosById = new Map(proyectos.map((p) => [p.databaseId, p]));
  const selectedProyectos: ProyectoData[] = selectedIds
    .map((id) => proyectosById.get(id))
    .filter((p): p is ProyectoData => Boolean(p));

  const missing = selectedIds.filter((id) => !proyectosById.has(id));
  if (missing.length > 0) {
    console.warn(
      `[Home] reels.selected referencia databaseId(s) no encontrados: ${missing.join(', ')}`,
    );
  }

  const mediaIds = [
    toAttachmentId(home.hero.image),
    ...selectedProyectos.flatMap((p) => [toAttachmentId(p.video), toAttachmentId(p.videoPoster)]),
  ].filter((n): n is number => n !== null);
  const mediaUrls = await getMediaUrls(mediaIds);

  const heroImageId = toAttachmentId(home.hero.image);
  const heroImageUrl = heroImageId !== null ? mediaUrls.get(heroImageId) ?? null : home.hero.image;

  const resolvedProyectos: ProyectoData[] = selectedProyectos.map((p) => {
    const videoId = toAttachmentId(p.video);
    const posterId = toAttachmentId(p.videoPoster);
    return {
      ...p,
      video: videoId !== null ? mediaUrls.get(videoId) ?? '' : p.video,
      videoPoster: posterId !== null ? mediaUrls.get(posterId) ?? null : p.videoPoster,
    };
  });

  return (
    <main>
      <Hero
        image={heroImageUrl}
        imageCaption={home.hero.imageCaption}
        whatsappNumber={general.whatsappNumber}
      />
      <ProblemsSection />
      <ReelsSection
        proyectos={resolvedProyectos}
        whatsappNumber={general.whatsappNumber}
      />
      <ProcessSection whatsappNumber={general.whatsappNumber} />
    </main>
  );
}
