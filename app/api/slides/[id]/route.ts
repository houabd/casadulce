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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const slide = await prisma.heroSlide.update({ where: { id: Number(id) }, data: parsed.data });
  return NextResponse.json(slide);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  await prisma.heroSlide.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
