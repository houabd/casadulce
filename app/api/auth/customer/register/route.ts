import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signCustomerToken, buildCookieOptions } from "@/lib/customer-session";

const schema = z.object({
  name: z.string().min(2, "Nom requis (min. 2 caractères)"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(/^\d{10}$/, "Numéro à 10 chiffres requis"),
  password: z.string().min(6, "Mot de passe min. 6 caractères"),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides" },
      { status: 400 }
    );

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing)
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const customer = await prisma.customer.create({
    data: { name, email, phone, password: hashed },
  });

  const token = await signCustomerToken({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? "",
  });

  const res = NextResponse.json({ success: true }, { status: 201 });
  res.cookies.set(buildCookieOptions(token));
  return res;
}
