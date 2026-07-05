import { config } from "dotenv";
config({ path: ".env.local", override: true });

import { PrismaClient, DayOfWeek } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@casadulce.dz";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123456";

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
    },
  });

  // Catégories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: "Crêpes", icon: "🥞", order: 1 },
    }),
    prisma.category.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, name: "Desserts", icon: "🍰", order: 2 },
    }),
    prisma.category.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, name: "Jus", icon: "🍹", order: 3 },
    }),
  ]);

  // Produits de test
  const crepe1 = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Crêpe Nutella",
      description: "Crêpe garnie de Nutella et banane",
      price: 350,
      images: [],
      available: true,
      isPopular: true,
      supplements: {
        create: [
          { name: "Chantilly", price: 50 },
          { name: "Amandes effilées", price: 30 },
        ],
      },
    },
  });

  const crepe2 = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "Crêpe Fromage",
      description: "Crêpe salée au fromage fondu",
      price: 300,
      images: [],
      available: true,
      isNew: true,
      supplements: {
        create: [{ name: "Jambon", price: 80 }],
      },
    },
  });

  const dessert1 = await prisma.product.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "Waffle Caramel",
      description: "Gaufre croustillante nappée de caramel maison",
      price: 400,
      images: [],
      available: true,
      isPopular: true,
    },
  });

  const jus1 = await prisma.product.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      name: "Jus d'Orange Frais",
      description: "Pressé à la minute",
      price: 200,
      images: [],
      available: true,
    },
  });

  // Liaison produits ↔ catégories
  await prisma.productCategory.createMany({
    data: [
      { productId: crepe1.id, categoryId: categories[0].id },
      { productId: crepe2.id, categoryId: categories[0].id },
      { productId: dessert1.id, categoryId: categories[1].id },
      { productId: jus1.id, categoryId: categories[2].id },
    ],
    skipDuplicates: true,
  });

  // Horaires — 7 jours
  const days: DayOfWeek[] = [
    DayOfWeek.LUNDI,
    DayOfWeek.MARDI,
    DayOfWeek.MERCREDI,
    DayOfWeek.JEUDI,
    DayOfWeek.VENDREDI,
    DayOfWeek.SAMEDI,
    DayOfWeek.DIMANCHE,
  ];

  for (const day of days) {
    await prisma.openingHours.upsert({
      where: { day },
      update: {},
      create: {
        day,
        isOpen: day !== DayOfWeek.DIMANCHE,
        openTime: "09:00",
        closeTime: "22:00",
        note: day === DayOfWeek.DIMANCHE ? "Fermé le dimanche" : null,
      },
    });
  }

  console.log("✅ Seed terminé — admin, catégories, produits, horaires créés");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
