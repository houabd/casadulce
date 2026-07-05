import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "cd_customer";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export interface CustomerSession {
  id: number;
  name: string;
  email: string;
  phone: string;
}

function secret() {
  return new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET ?? "casa-dulce-customer-secret"
  );
}

export async function signCustomerToken(
  session: CustomerSession
): Promise<string> {
  return new SignJWT(session as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyCustomerToken(
  token: string
): Promise<CustomerSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const { id, name, email, phone } = payload as Record<string, unknown>;
    if (!id || !name || !email) return null;
    return {
      id: Number(id),
      name: String(name),
      email: String(email),
      phone: String(phone ?? ""),
    };
  } catch {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function buildCookieOptions(token: string) {
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

export function clearCookieOptions() {
  return { name: COOKIE, value: "", httpOnly: true, maxAge: 0, path: "/" };
}
