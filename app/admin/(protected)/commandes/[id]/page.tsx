import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, MODE_LABELS } from "@/lib/order-constants";
import OrderStatusSelector from "@/components/admin/OrderStatusSelector";
import PrintButton from "@/components/admin/PrintButton";

export const dynamic = "force-dynamic";

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });
  if (!order) notFound();

  const sups = (items: typeof order.items[0]) =>
    items.supplements as { name: string; price: number }[];

  const dateStr = formatDate(order.createdAt);

  return (
    <>
      {/* Screen view */}
      <div className="space-y-6 max-w-2xl mx-auto print:hidden">
        {/* Back + actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/admin/commandes"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Commandes
          </Link>
          <PrintButton />
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-sage-100 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Commande</p>
              <h1 className="font-cormorant text-4xl font-semibold text-sage-800 mt-1">
                #{order.number}
              </h1>
              <p className="text-sm text-gray-400 mt-1">{dateStr}</p>
            </div>
            <span
              className={`text-sm font-semibold px-4 py-1.5 rounded-full ${STATUS_COLORS[order.status]}`}
            >
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>
        </div>

        {/* Customer */}
        <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Client
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-xs text-gray-400">Nom</p>
              <p className="font-medium text-gray-800 mt-0.5">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Téléphone</p>
              <p className="font-medium text-gray-800 mt-0.5">{order.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Mode</p>
              <p className="font-medium text-gray-800 mt-0.5">
                {MODE_LABELS[order.mode] ?? order.mode}
              </p>
            </div>
            {order.address && (
              <div>
                <p className="text-xs text-gray-400">Adresse</p>
                <p className="font-medium text-gray-800 mt-0.5">{order.address}</p>
              </div>
            )}
          </div>
          {order.note && (
            <div className="border-t border-sage-100 pt-3">
              <p className="text-xs text-gray-400">Note</p>
              <p className="text-sm text-gray-600 italic mt-0.5">{order.note}</p>
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Articles
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => {
              const supplements = sups(item);
              return (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">
                      {item.quantity} × {item.productName}
                    </p>
                    {supplements.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        + {supplements.map((s) => s.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="font-medium text-gold-600 whitespace-nowrap">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-sage-100 pt-4 flex items-center justify-between">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="font-cormorant text-2xl font-semibold text-gold-600">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Status selector */}
        <div className="bg-white rounded-2xl border border-sage-100 p-6">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Gestion du statut
          </h2>
          <OrderStatusSelector
            orderId={order.id}
            initialStatus={order.status}
          />
        </div>
      </div>

      {/* Print-only ticket */}
      <div className="hidden print:block font-mono text-sm text-black bg-white p-4 max-w-xs mx-auto">
        <div className="text-center border-b border-black pb-3 mb-3">
          <p className="text-lg font-bold tracking-widest">CASA DULCE</p>
          <p className="text-xs">Crêpes · Desserts · Jus frais</p>
        </div>

        <div className="border-b border-black pb-3 mb-3 space-y-1">
          <div className="flex justify-between">
            <span>Commande</span>
            <span className="font-bold">#{order.number}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Date</span>
            <span>{dateStr}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Mode</span>
            <span>{MODE_LABELS[order.mode] ?? order.mode}</span>
          </div>
          {order.address && (
            <div className="text-xs">
              <span>Adresse : </span>
              <span>{order.address}</span>
            </div>
          )}
        </div>

        <div className="border-b border-black pb-3 mb-3 space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Client</span>
            <span>{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Tél</span>
            <span>{order.phone}</span>
          </div>
        </div>

        <div className="border-b border-black pb-3 mb-3 space-y-1.5">
          {order.items.map((item) => {
            const supplements = sups(item);
            return (
              <div key={item.id}>
                <div className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                  <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
                {supplements.map((s) => (
                  <div key={s.name} className="flex justify-between text-xs pl-4">
                    <span>+ {s.name}</span>
                    {s.price > 0 && <span>{formatPrice(s.price)}</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between font-bold text-base">
          <span>TOTAL</span>
          <span>{formatPrice(order.total)}</span>
        </div>

        {order.note && (
          <div className="border-t border-black mt-3 pt-3 text-xs">
            <span>Note : </span>
            <span className="italic">{order.note}</span>
          </div>
        )}

        <div className="text-center text-xs mt-6 text-gray-500">
          Merci de votre visite !
        </div>
      </div>
    </>
  );
}
