import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SlideDeleteButton from "@/components/admin/SlideDeleteButton";
import HeroImageManager from "@/components/admin/HeroImageManager";

export default async function SlidesPage() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
  let currentImage = "/BOUTIQUE.jpg";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = await (prisma as any).siteSetting?.findUnique({ where: { key: "heroImage" } });
    if (s?.value) currentImage = s.value;
  } catch { /* siteSetting dispo après redémarrage */ }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Image de fond du hero statique */}
      <HeroImageManager currentImage={currentImage} />

      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-semibold text-sage-800">Slides Hero</h1>
        <Link
          href="/admin/slides/nouveau"
          className="px-4 py-2 bg-sage-600 text-white text-sm rounded-lg hover:bg-sage-700 transition-colors"
        >
          + Nouveau slide
        </Link>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🖼️</p>
          <p>Aucun slide. Le hero statique sera affiché.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="bg-white rounded-xl border border-sage-100 p-4 flex items-center gap-4"
            >
              {slide.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-14 rounded-lg bg-cream-100 flex items-center justify-center flex-shrink-0 text-2xl">
                  🖼️
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{slide.title}</p>
                {slide.subtitle && (
                  <p className="text-sm text-gray-400 truncate">{slide.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      slide.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {slide.active ? "Actif" : "Inactif"}
                  </span>
                  <span className="text-xs text-gray-400">Ordre : {slide.order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/admin/slides/${slide.id}`}
                  className="px-3 py-1.5 text-xs bg-sage-50 text-sage-700 rounded-lg hover:bg-sage-100 transition-colors"
                >
                  Modifier
                </Link>
                <SlideDeleteButton id={slide.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
