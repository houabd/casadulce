import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrdersTable, { type OrderRow } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function CommandesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const raw = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true } } },
  });

  const orders: OrderRow[] = raw.map((o) => ({
    id: o.id,
    number: o.number,
    customerName: o.customerName,
    phone: o.phone,
    mode: o.mode,
    status: o.status,
    total: o.total,
    createdAt: o.createdAt.toISOString(),
    items: o.items,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-cormorant text-3xl font-semibold text-sage-800">
          Commandes
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          {orders.length} commande{orders.length !== 1 ? "s" : ""} au total
        </p>
      </div>
      <OrdersTable initialOrders={orders} />
    </div>
  );
}
