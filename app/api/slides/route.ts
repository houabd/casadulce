import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable(),
  ctaLink: z.string().optional().nullable(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  const slides = await prisma.heroSlide.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(slides);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slide = await prisma.heroSlide.create({ data: parsed.data });
  return NextResponse.json(slide, { status: 201 });
}
