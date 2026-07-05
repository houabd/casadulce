import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const supplementSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
});

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().positive().optional(),
  available: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  categoryIds: z.array(z.number()).optional(),
  supplements: z.array(supplementSchema).optional(),
  images: z.array(z.string()).optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { categories: { include: { category: true } }, supplements: true },
  });
  if (!product) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await context.params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { categoryIds, supplements, ...data } = parsed.data;

  const product = await prisma.$transaction(async (tx) => {
    if (supplements !== undefined) {
      await tx.supplement.deleteMany({ where: { productId: Number(id) } });
    }
    if (categoryIds !== undefined) {
      await tx.productCategory.deleteMany({ where: { productId: Number(id) } });
    }

    return tx.product.update({
      where: { id: Number(id) },
      data: {
        ...data,
        ...(supplements !== undefined && { supplements: { create: supplements } }),
        ...(categoryIds !== undefined && {
          categories: { create: categoryIds.map((cid) => ({ categoryId: cid })) },
        }),
      },
      include: { categories: { include: { category: true } }, supplements: true },
    });
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await context.params;

  // Soft delete si des commandes existent
  const hasOrders = await prisma.orderItem.count({ where: { productId: Number(id) } });
  if (hasOrders > 0) {
    await prisma.product.update({
      where: { id: Number(id) },
      data: { available: false },
    });
    return NextResponse.json({ softDeleted: true });
  }

  await prisma.product.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
