import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signCustomerToken, buildCookieOptions } from "@/lib/customer-session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { email, password } = parsed.data;

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer)
    return NextResponse.json(
      { error: "Email ou mot de passe incorrect" },
      { status: 401 }
    );

  const valid = await bcrypt.compare(password, customer.password);
  if (!valid)
    return NextResponse.json(
      { error: "Email ou mot de passe incorrect" },
      { status: 401 }
    );

  const token = await signCustomerToken({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? "",
  });

  const res = NextResponse.json({ success: true });
  res.cookies.set(buildCookieOptions(token));
  return res;
}
