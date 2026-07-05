import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <h1 className="font-cormorant text-3xl font-semibold text-sage-800">Catégories</h1>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
