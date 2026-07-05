import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
});

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const last = await prisma.category.findFirst({ orderBy: { order: "desc" } });
  const category = await prisma.category.create({
    data: { name: parsed.data.name, order: (last?.order ?? -1) + 1 },
  });
  return NextResponse.json(category, { status: 201 });
}
