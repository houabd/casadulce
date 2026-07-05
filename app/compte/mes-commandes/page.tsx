import { getCustomerSession } from "@/lib/customer-session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MesCommandesClient, {
  type CustomerOrder,
} from "@/components/compte/MesCommandesClient";

export const dynamic = "force-dynamic";

export default async function MesCommandesPage() {
  const session = await getCustomerSession();
  if (!session) redirect("/compte/login");

  const raw = await prisma.order.findMany({
    where: { customerId: session.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const orders: CustomerOrder[] = raw.map((o) => ({
    id: o.id,
    number: o.number,
    status: o.status,
    mode: o.mode,
    total: o.total,
    note: o.note,
    address: o.address,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      supplements: item.supplements as { name: string; price: number }[],
    })),
  }));

  return (
    <MesCommandesClient
      initialOrders={orders}
      customerId={session.id}
      customerName={session.name}
    />
  );
}
