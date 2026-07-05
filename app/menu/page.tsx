import { prisma } from "@/lib/prisma";
import MenuClient from "@/components/menu/MenuClient";
import type { MenuProduct } from "@/components/menu/ProductCard";

async function getData() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { available: true },
      include: {
        categories: { include: { category: true } },
        supplements: { orderBy: { id: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);
  return { products, categories };
}

export const dynamic = "force-dynamic";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const initialCategory = cat ? parseInt(cat, 10) || null : null;

  const { products, categories } = await getData();

  const menuProducts: MenuProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    images: p.images,
    isNew: p.isNew,
    isPopular: p.isPopular,
    supplements: p.supplements,
    categoryIds: p.categories.map((c) => c.categoryId),
  }));

  return (
    <MenuClient
      products={menuProducts}
      categories={categories}
      initialCategory={initialCategory}
    />
  );
}
