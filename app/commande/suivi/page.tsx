import { getOrderSession } from "@/lib/order-session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SuiviClient, { type SuiviOrder } from "@/components/commande/SuiviClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuiviPage() {
  const orderId = await getOrderSession();

  if (!orderId) {
    return (
      <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <p className="font-cormorant text-4xl font-semibold text-sage-800">
          Session expirée
        </p>
        <p className="text-sm text-gray-400 max-w-xs">
          Le lien de suivi est valable 2 heures après la commande.
        </p>
        <Link
          href="/menu"
          className="px-6 py-2.5 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 transition-colors"
        >
          Retour au menu
        </Link>
      </main>
    );
  }

  const raw = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!raw) redirect("/menu");

  const order: SuiviOrder = {
    id: raw.id,
    number: raw.number,
    status: raw.status,
    mode: raw.mode,
    address: raw.address,
    total: raw.total,
    note: raw.note,
    createdAt: raw.createdAt.toISOString(),
    items: raw.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      supplements: item.supplements as { name: string; price: number }[],
    })),
  };

  return <SuiviClient order={order} />;
}
