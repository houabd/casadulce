import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const tables = [
  "Product",
  "Category",
  "Supplement",
  "Order",
  "OrderItem",
  "Customer",
  "Admin",
  "OpeningHours",
];

async function main() {
  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`
    );
  }
  console.log("✅ Séquences corrigées");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
