"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

type Category = { id: number; name: string };
type ProductCategory = { category: Category };
type Supplement = { id: number; name: string };
type Product = {
  id: number;
  name: string;
  price: number;
  available: boolean;
  isNew: boolean;
  isPopular: boolean;
  images: string[];
  categories: ProductCategory[];
  supplements: Supplement[];
};

export default function ProductsTable({
  products: initial,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [filterCat, setFilterCat] = useState("");
  const [filterAvail, setFilterAvail] = useState("");

  const filtered = products.filter((p) => {
    if (filterAvail === "true" && !p.available) return false;
    if (filterAvail === "false" && p.available) return false;
    if (filterCat && !p.categories.some((c) => String(c.category.id) === filterCat)) return false;
    return true;
  });

  async function toggleAvailable(product: Product) {
    await fetch(`/api/produits/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !product.available }),
    });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, available: !p.available } : p))
    );
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`/api/produits/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.softDeleted) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, available: false } : p))
      );
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function handleDuplicate(product: Product) {
    const res = await fetch(`/api/produits/${product.id}`);
    const data = await res.json();
    await fetch("/api/produits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${data.name} (copie)`,
        description: data.description,
        price: data.price,
        available: false,
        isNew: data.isNew,
        isPopular: data.isPopular,
        images: data.images,
        categoryIds: data.categories.map((c: ProductCategory) => c.category.id),
        supplements: data.supplements.map((s: { name: string; price: number }) => ({
          name: s.name,
          price: s.price,
        })),
      }),
    });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-sage-100 overflow-hidden">
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-sage-100">
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-400"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={filterAvail}
          onChange={(e) => setFilterAvail(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-400"
        >
          <option value="">Tous</option>
          <option value="true">Disponibles</option>
          <option value="false">Indisponibles</option>
        </select>
        <span className="text-sm text-gray-400 ml-auto">{filtered.length} produit(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">Aucun produit trouvé</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-cream-50 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Photo</th>
              <th className="px-4 py-3 text-left">Nom & Suppléments</th>
              <th className="px-4 py-3 text-left">Prix</th>
              <th className="px-4 py-3 text-left">Catégorie</th>
              <th className="px-4 py-3 text-left">Badges</th>
              <th className="px-4 py-3 text-left">Dispo</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-cream-50">
                <td className="px-4 py-3">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-cream-100 flex items-center justify-center">
                      <span className="text-gray-300 text-xs">IMG</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{p.name}</p>
                  {p.supplements.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.supplements.map((s) => (
                        <span key={s.id} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gold-600 font-medium whitespace-nowrap">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.categories.map((c) => (
                      <Badge key={c.category.id} variant="sage">
                        {c.category.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {p.isNew && <Badge variant="blue">Nouveau</Badge>}
                    {p.isPopular && <Badge variant="gold">Populaire</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAvailable(p)}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                      p.available ? "bg-sage-400" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 mt-0.5 ml-0.5 rounded-full bg-white shadow transition-transform ${
                        p.available ? "translate-x-4" : ""
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/produits/${p.id}`}>
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>
                      ✕
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
