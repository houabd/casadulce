import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { getPusher } from "@/lib/pusher";
import { getCustomerSession } from "@/lib/customer-session";
import { signOrderToken, buildOrderCookieOptions, buildOrderHintCookieOptions } from "@/lib/order-session";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const mode = searchParams.get("mode");
  const date = searchParams.get("date");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (mode) where.mode = mode;
  if (date === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else if (date === "week") {
    const start = new Date();
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true } } },
  });

  return NextResponse.json(orders);
}

const itemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  supplements: z.array(z.object({ name: z.string() })),
});

const schema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(8),
  mode: z.enum(["SUR_PLACE", "RETRAIT", "LIVRAISON"]),
  address: z.string().optional(),
  note: z.string().optional(),
  items: z.array(itemSchema).min(1),
});

async function nextOrderNumber(): Promise<string> {
  const last = await prisma.order.findFirst({
    orderBy: { createdAt: "desc" },
    select: { number: true },
  });
  const n = last ? parseInt(last.number, 10) : 0;
  return String(n + 1).padStart(4, "0");
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { customerName, phone, mode, address, note, items } = parsed.data;

  // Rattachement auto si client connecté
  const customerSession = await getCustomerSession();
  const customerId = customerSession?.id ?? null;

  if (mode === "LIVRAISON" && !address?.trim())
    return NextResponse.json(
      { error: "Adresse requise pour la livraison" },
      { status: 400 }
    );

  // Fetch products to recalculate server-side prices
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, available: true },
    include: { supplements: true },
  });

  if (products.length !== productIds.length)
    return NextResponse.json(
      { error: "Un ou plusieurs produits ne sont plus disponibles" },
      { status: 400 }
    );

  let total = 0;
  const orderItemsData = [];

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    let unitPrice = product.price;
    const resolvedSupplements: { name: string; price: number }[] = [];

    for (const s of item.supplements) {
      const dbSup = product.supplements.find((sup) => sup.name === s.name);
      if (dbSup) {
        unitPrice += dbSup.price;
        resolvedSupplements.push({ name: dbSup.name, price: dbSup.price });
      }
    }

    total += unitPrice * item.quantity;
    orderItemsData.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice,
      supplements: resolvedSupplements,
    });
  }

  const number = await nextOrderNumber();

  const order = await prisma.order.create({
    data: {
      number,
      customerName,
      phone,
      mode,
      address: address ?? null,
      note: note ?? null,
      total,
      status: "NOUVELLE",
      customerId,
      items: {
        create: orderItemsData.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          supplements: item.supplements,
        })),
      },
    },
  });

  const pusher = getPusher();
  if (pusher) {
    try {
      await pusher.trigger("orders", "new-order", {
        id: order.id,
        number: order.number,
        customerName: order.customerName,
        total: order.total,
        mode: order.mode,
      });
    } catch {
      // Notification failure doesn't break the order
    }
  }

  // Cookie de suivi 2h (HTTP-only JWT + hint lisible côté client)
  const orderToken = await signOrderToken(order.id);
  const res = NextResponse.json(
    { id: order.id, number: order.number },
    { status: 201 }
  );
  res.cookies.set(buildOrderCookieOptions(orderToken));
  res.cookies.set(buildOrderHintCookieOptions());
  return res;
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { ids } = await request.json() as { ids: number[] };
  if (!Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: "Aucun identifiant fourni" }, { status: 400 });

  await prisma.order.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ deleted: ids.length });
}
