import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ProductsTable from "@/components/admin/ProductsTable";

async function getProducts() {
  return prisma.product.findMany({
    include: {
      categories: { include: { category: true } },
      supplements: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export default async function ProduitsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-cormorant text-3xl font-semibold text-sage-800">Produits</h1>
        <Link href="/admin/produits/nouveau">
          <Button>+ Nouveau produit</Button>
        </Link>
      </div>
      <ProductsTable products={products} categories={categories} />
    </div>
  );
}
