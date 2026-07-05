"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotal } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import OrderForm from "@/components/commande/OrderForm";
import Link from "next/link";

export default function CommandePage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.replace("/menu");
    }
  }, [mounted, items.length, router]);

  if (!mounted || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-sage-300 border-t-sage-500 animate-spin" />
      </div>
    );
  }

  const total = cartTotal(items);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/menu" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <h1 className="font-cormorant text-3xl font-semibold text-sage-800">
          Votre commande
        </h1>
      </div>

      {/* Résumé panier */}
      <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Résumé
          </h2>
          <Link
            href="/menu"
            className="text-xs text-sage-600 hover:text-sage-800 underline"
          >
            Modifier
          </Link>
        </div>
        {items.map((item) => {
          const itemPrice =
            item.basePrice +
            item.supplements.reduce((s, sup) => s + sup.price, 0);
          return (
            <div key={item.cartId} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {item.quantity} × {item.name}
                </p>
                {item.supplements.length > 0 && (
                  <p className="text-xs text-gray-400">
                    + {item.supplements.map((s) => s.name).join(", ")}
                  </p>
                )}
              </div>
              <span className="text-sm font-medium text-gold-600 whitespace-nowrap">
                {formatPrice(itemPrice * item.quantity)}
              </span>
            </div>
          );
        })}
        <div className="flex items-center justify-between pt-3 border-t border-sage-100">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="font-cormorant text-xl font-semibold text-gold-600">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Formulaire commande */}
      <OrderForm />
    </main>
  );
}
