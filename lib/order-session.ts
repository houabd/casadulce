import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "cd_order";
const MAX_AGE = 60 * 60 * 2; // 2 heures

function secret() {
  return new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET ?? "casa-dulce-order-secret"
  );
}

export async function signOrderToken(orderId: number): Promise<string> {
  return new SignJWT({ orderId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("2h")
    .sign(secret());
}

export async function getOrderSession(): Promise<number | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.orderId) return null;
    return Number(payload.orderId);
  } catch {
    return null;
  }
}

export function buildOrderCookieOptions(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
    path: "/",
  };
}

// Cookie lisible côté client pour afficher le lien "Suivre ma commande" dans la Navbar
export function buildOrderHintCookieOptions() {
  return {
    name: "cd_order_hint",
    value: "1",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE,
    path: "/",
  };
}
