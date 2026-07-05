import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

async function getProduct(id: number) {
  return prisma.product.findUnique({
    where: { id },
    include: { categories: { include: { category: true } }, supplements: true },
  });
}

async function getCategories() {
  return prisma.category.findMany({ orderBy: { order: "asc" } });
}

export default async function EditProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(Number(id)),
    getCategories(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="font-cormorant text-3xl font-semibold text-sage-800">
        Modifier — {product.name}
      </h1>
      <ProductForm
        categories={categories}
        defaultValues={{
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          available: product.available,
          isNew: product.isNew,
          isPopular: product.isPopular,
          images: product.images,
          categoryIds: product.categories.map((c) => c.categoryId),
          supplements: product.supplements.map((s) => ({ name: s.name, price: s.price })),
        }}
        productId={product.id}
      />
    </div>
  );
}
