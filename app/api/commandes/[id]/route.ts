import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { getPusher } from "@/lib/pusher";

const statusSchema = z.object({
  status: z.enum(["NOUVELLE", "CONFIRMEE", "PRETE", "LIVREE", "ANNULEE"]),
});

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await context.params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

  return NextResponse.json(order);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.update({
    where: { id: Number(id) },
    data: { status: parsed.data.status },
  });

  const pusher = getPusher();
  if (pusher) {
    try {
      await pusher.trigger("orders", "status-update", {
        id: order.id,
        number: order.number,
        status: order.status,
      });
      // Notifier aussi le canal du client si la commande lui est rattachée
      // Canal client connecté
      if (order.customerId) {
        await pusher.trigger(`customer-${order.customerId}`, "order-status-update", {
          id: order.id,
          status: order.status,
        });
      }
      // Canal suivi anonyme (2h)
      await pusher.trigger(`order-${order.id}`, "order-status-update", {
        id: order.id,
        status: order.status,
      });
    } catch {
      // Notification failure is non-fatal
    }
  }

  return NextResponse.json(order);
}
