import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const supplementSchema = z.object({
  name: z.string().min(1),
  price: z.number().min(0),
});

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional().nullable(),
  price: z.number().positive("Prix invalide"),
  available: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  categoryIds: z.array(z.number()).default([]),
  supplements: z.array(supplementSchema).default([]),
  images: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");
  const available = searchParams.get("available");

  const products = await prisma.product.findMany({
    where: {
      ...(available !== null && { available: available === "true" }),
      ...(categoryId && {
        categories: { some: { categoryId: Number(categoryId) } },
      }),
    },
    include: {
      categories: { include: { category: true } },
      supplements: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { categoryIds, supplements, ...data } = parsed.data;

  const product = await prisma.product.create({
    data: {
      ...data,
      supplements: { create: supplements },
      categories: {
        create: categoryIds.map((id) => ({ categoryId: id })),
      },
    },
    include: { categories: { include: { category: true } }, supplements: true },
  });
  return NextResponse.json(product, { status: 201 });
}
