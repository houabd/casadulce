import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);

  const products = await prisma.product.findMany({
    where: {
      available: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    include: {
      categories: { include: { category: true }, take: 1 },
    },
    take: 8,
  });

  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images[0] ?? null,
      categoryId: p.categories[0]?.categoryId ?? null,
      categoryName: p.categories[0]?.category?.name ?? null,
    }))
  );
}
