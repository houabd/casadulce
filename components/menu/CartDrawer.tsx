"use client";

import Link from "next/link";
import { useCartStore, cartTotal, cartItemCount } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const total = cartTotal(items);
  const count = cartItemCount(items);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage-100">
          <h2 className="font-cormorant text-xl font-semibold text-sage-800">
            Panier{" "}
            {count > 0 && (
              <span className="text-gold-500">({count} article{count > 1 ? "s" : ""})</span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
              <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-sm">Votre panier est vide</p>
              <button
                onClick={closeCart}
                className="text-sm text-sage-500 hover:text-sage-700 underline"
              >
                Voir le menu
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemPrice =
                item.basePrice +
                item.supplements.reduce((s, sup) => s + sup.price, 0);
              return (
                <div key={item.cartId} className="flex gap-3">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-cream-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {item.name}
                    </p>
                    {item.supplements.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        + {item.supplements.map((s) => s.name).join(", ")}
                      </p>
                    )}
                    <p className="text-gold-600 text-sm font-medium mt-1">
                      {formatPrice(itemPrice)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 text-gray-600 hover:border-sage-400 hover:text-sage-600 transition-colors flex items-center justify-center text-base leading-none"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-gray-200 text-gray-600 hover:border-sage-400 hover:text-sage-600 transition-colors flex items-center justify-center text-base leading-none"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.cartId)}
                        className="ml-auto text-red-300 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-sage-100 px-6 py-5 space-y-4 bg-cream-50">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Total</span>
              <span className="font-cormorant text-2xl font-semibold text-gold-600">
                {formatPrice(total)}
              </span>
            </div>
            <Link
              href="/commande"
              onClick={closeCart}
              className="block w-full py-3 bg-sage-400 text-white rounded-xl font-medium hover:bg-sage-500 transition-colors tracking-wide text-center"
            >
              Passer la commande
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
