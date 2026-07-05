import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SlideForm from "@/components/admin/SlideForm";

export default async function EditSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slide = await prisma.heroSlide.findUnique({ where: { id: Number(id) } });
  if (!slide) notFound();

  return (
    <div className="max-w-lg">
      <h1 className="font-cormorant text-2xl font-semibold text-sage-800 mb-6">Modifier le slide</h1>
      <SlideForm
        slideId={slide.id}
        defaultValues={{
          title: slide.title,
          subtitle: slide.subtitle ?? "",
          image: slide.image,
          ctaText: slide.ctaText ?? "",
          ctaLink: slide.ctaLink ?? "",
          order: slide.order,
          active: slide.active,
        }}
      />
    </div>
  );
}
