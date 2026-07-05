"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard, { type MenuProduct } from "./ProductCard";

interface Category {
  id: number;
  name: string;
}

export default function MenuClient({
  products,
  categories,
  initialCategory = null,
}: {
  products: MenuProduct[];
  categories: Category[];
  initialCategory?: number | null;
}) {
  const [activeCategory, setActiveCategory] = useState<number | null>(initialCategory);

  const filtered =
    activeCategory === null
      ? products
      : products.filter((p) => p.categoryIds.includes(activeCategory));

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-cormorant text-4xl font-semibold text-sage-800 mb-2">
        Notre Menu
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        {products.length} produit{products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}
      </p>

      {/* Filtres catégories */}
      <div className="sticky top-16 z-10 -mx-4 px-4 py-3 bg-cream-50/95 backdrop-blur-sm border-b border-sage-100 mb-8">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === null
                ? "bg-sage-400 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-sage-300"
            }`}
          >
            Tout
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-sage-400 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-sage-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grille produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400">
            Aucun produit dans cette catégorie
          </div>
        )}
      </div>

    </main>
  );
}
