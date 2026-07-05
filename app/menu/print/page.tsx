import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import PrintButton from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

export default async function MenuPrintPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      products: {
        where: { product: { available: true } },
        include: {
          product: {
            include: { supplements: true },
          },
        },
        orderBy: { product: { createdAt: "asc" } },
      },
    },
  });

  const filtered = categories.filter((c) => c.products.length > 0);

  return (
    <>
      <style>{`
        nav, header { display: none !important; }
        body { background: white !important; }
        @page { margin: 15mm; size: A4; }
      `}</style>

      {/* Bouton imprimer (masqué à l'impression) */}
      <div className="print:hidden flex justify-end max-w-2xl mx-auto px-8 pt-6">
        <PrintButton />
      </div>

      {/* Contenu imprimable */}
      <div className="max-w-2xl mx-auto px-8 py-12">
        {/* En-tête */}
        <div className="text-center mb-12 border-b border-gray-200 pb-8">
          <h1 className="font-cormorant text-5xl font-semibold text-sage-800 mb-1">Casa Dulce</h1>
          <p className="text-sm tracking-widest uppercase text-gray-400">Crêpes · Desserts · Jus frais</p>
        </div>

        {/* Catégories */}
        <div className="space-y-10">
          {filtered.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center gap-3 mb-4">
                {cat.icon && <span className="text-xl">{cat.icon}</span>}
                <h2 className="font-cormorant text-2xl font-semibold text-sage-800 tracking-wide">
                  {cat.name}
                </h2>
                <div className="flex-1 border-b border-gray-200" />
              </div>

              <div className="space-y-3">
                {cat.products.map(({ product: p }) => (
                  <div key={p.id} className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{p.description}</p>
                      )}
                      {p.supplements.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5 italic">
                          Suppléments : {p.supplements.map((s) => `${s.name} (+${formatPrice(s.price)})`).join(", ")}
                        </p>
                      )}
                    </div>
                    <span className="font-cormorant text-lg font-semibold text-gold-600 flex-shrink-0">
                      {formatPrice(p.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
