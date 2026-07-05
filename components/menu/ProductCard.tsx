"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

interface Supplement {
  id: number;
  name: string;
  price: number;
}

export interface MenuProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  isNew: boolean;
  isPopular: boolean;
  categoryIds: number[];
  supplements: Supplement[];
}

export default function ProductCard({ product }: { product: MenuProduct }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Supplement[]>([]);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  function toggleSupplement(sup: Supplement) {
    setSelected((prev) =>
      prev.some((s) => s.id === sup.id)
        ? prev.filter((s) => s.id !== sup.id)
        : [...prev, sup]
    );
  }

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      basePrice: product.price,
      image: product.images[0],
      supplements: selected.map((s) => ({ name: s.name, price: s.price })),
    });
    setModalOpen(false);
    setSelected([]);
    openCart();
  }

  function openModal() {
    setSelected([]);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelected([]);
  }

  const total =
    product.price + selected.reduce((s, sup) => s + sup.price, 0);

  return (
    <>
      {/* Card */}
      <div
        onClick={openModal}
        className="bg-white rounded-2xl overflow-hidden border border-sage-100 hover:shadow-md hover:border-sage-200 transition-all cursor-pointer group"
      >
        <div className="relative h-48 bg-cream-100 overflow-hidden">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sage-200">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {(product.isNew || product.isPopular) && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {product.isNew && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                  Nouveau
                </span>
              )}
              {product.isPopular && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold-400 text-white font-medium">
                  Populaire
                </span>
              )}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-sage-700 transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto">
            <span className="font-cormorant text-lg font-semibold text-gold-600">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-sage-50 text-sage-700 group-hover:bg-sage-400 group-hover:text-white transition-colors">
              + Ajouter
            </span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {product.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            )}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-gray-800 shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 space-y-4">
              <div>
                <h2 className="font-cormorant text-2xl font-semibold text-sage-800">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                )}
              </div>

              {product.supplements.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Suppléments
                  </h3>
                  <div className="space-y-1">
                    {product.supplements.map((sup) => {
                      const checked = selected.some((s) => s.id === sup.id);
                      return (
                        <label
                          key={sup.id}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-cream-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleSupplement(sup)}
                              className="w-4 h-4 accent-sage-400"
                            />
                            <span className="text-sm text-gray-700">{sup.name}</span>
                          </div>
                          {sup.price > 0 && (
                            <span className="text-sm text-gold-600 font-medium">
                              +{formatPrice(sup.price)}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-sage-100">
                <div>
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-cormorant text-xl font-semibold text-gold-600">
                    {formatPrice(total)}
                  </p>
                </div>
                <button
                  onClick={handleAdd}
                  className="px-6 py-2.5 bg-sage-400 text-white rounded-xl font-medium hover:bg-sage-500 transition-colors"
                >
                  Ajouter au panier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
