import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export default async function NouveauProduitPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="font-cormorant text-3xl font-semibold text-sage-800">Nouveau produit</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
