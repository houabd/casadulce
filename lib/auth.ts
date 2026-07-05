import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("[AUTH] authorize called", { email: credentials?.email });
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log("[AUTH] parse failed", parsed.error);
          return null;
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: { email: parsed.data.email },
          });
          console.log("[AUTH] admin found:", !!admin);
          if (!admin) return null;

          const valid = await bcrypt.compare(parsed.data.password, admin.password);
          console.log("[AUTH] password valid:", valid);
          if (!valid) return null;

          return { id: String(admin.id), email: admin.email, name: "Admin" };
        } catch (e) {
          console.error("[AUTH] error:", e);
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
});
