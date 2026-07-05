import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = await (prisma as any).admin.findUnique({ where: { email: "admin@casadulce.dz" } });
  if (!admin) {
    console.log("ADMIN NOT FOUND");
    return;
  }
  console.log("Admin trouvé:", admin.email);
  const valid = await bcrypt.compare("Admin@123456", admin.password);
  console.log("Mot de passe valide:", valid);
  await prisma.$disconnect();
  pool.end();
}

main().catch(console.error);
