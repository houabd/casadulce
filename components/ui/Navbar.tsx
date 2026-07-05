"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore, cartItemCount } from "@/lib/cart-store";
import { useSidebarStore } from "@/lib/sidebar-store";

export default function Navbar() {
  const items = useCartStore((s) => s.items);
  const toggleCart = useCartStore((s) => s.toggleCart);
  const count = cartItemCount(items);
  const { toggle: toggleSidebar } = useSidebarStore();

  return (
    <nav className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-sm border-b border-sage-100">
      <div className="max-w-full px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: sidebar toggle + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-sage-700 hover:bg-sage-50 rounded-lg transition-colors flex-shrink-0"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            href="/"
            className="font-cormorant text-2xl font-semibold text-sage-800 tracking-wide hover:text-sage-600 transition-colors"
          >
            Casa Dulce
          </Link>
        </div>

        {/* Right: compte + panier */}
        <div className="flex items-center gap-4">
          <Link
            href="/compte/mes-commandes"
            className="text-sm font-medium text-gray-600 hover:text-sage-700 transition-colors"
            aria-label="Mon compte"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </Link>

          <button
            onClick={toggleCart}
            className="relative p-1.5 text-gray-600 hover:text-sage-700 transition-colors"
            aria-label="Panier"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm5.625 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gold-400 text-white text-xs font-bold flex items-center justify-center leading-none">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
