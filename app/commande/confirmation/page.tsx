import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import ClearCart from "@/components/commande/ClearCart";

const MODE_LABELS: Record<string, string> = {
  SUR_PLACE: "Sur place",
  RETRAIT: "Retrait / À emporter",
  LIVRAISON: "Livraison",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });
  if (!order) notFound();

  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <>
      <ClearCart />
      <main className="max-w-lg mx-auto px-4 py-12 space-y-8">
        {/* Numéro de commande */}
        <div className="text-center space-y-2">
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Commande confirmée
          </p>
          <p className="font-cormorant text-7xl font-semibold text-sage-800">
            #{order.number}
          </p>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            Communiquez ce numéro pour confirmer votre commande
          </p>
          {whatsapp ? (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=Bonjour%2C+ma+commande+est+le+%23${order.number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Confirmer sur WhatsApp
            </a>
          ) : null}
        </div>

        {/* Détails commande */}
        <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Mode</span>
            <span className="font-medium text-gray-800">
              {MODE_LABELS[order.mode] ?? order.mode}
            </span>
          </div>
          {order.address && (
            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-500">Adresse</span>
              <span className="font-medium text-gray-800 text-right max-w-[60%]">
                {order.address}
              </span>
            </div>
          )}
          {order.note && (
            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-500">Note</span>
              <span className="text-gray-600 italic text-right max-w-[60%]">
                {order.note}
              </span>
            </div>
          )}

          <div className="border-t border-sage-100 pt-4 space-y-2">
            {order.items.map((item) => {
              const sups = item.supplements as { name: string; price: number }[];
              return (
                <div key={item.id} className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      {item.quantity} × {item.productName}
                    </p>
                    {sups.length > 0 && (
                      <p className="text-xs text-gray-400">
                        + {sups.map((s) => s.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-gold-600 font-medium whitespace-nowrap">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-3 border-t border-sage-100">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-cormorant text-xl font-semibold text-gold-600">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/commande/suivi"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-sage-300 text-sage-700 rounded-full text-sm font-medium hover:bg-sage-50 transition-colors"
          >
            Suivre ma commande →
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Retour au menu
          </Link>
        </div>
      </main>
    </>
  );
}
