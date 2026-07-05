"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/lib/sidebar-store";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
  id: number;
  name: string;
  price: number;
  image: string | null;
  categoryId: number | null;
  categoryName: string | null;
}

interface Category {
  id: number;
  name: string;
}

const PHONE = process.env.NEXT_PUBLIC_PHONE;
const ADDRESS = process.env.NEXT_PUBLIC_ADDRESS;
const MAPS_URL = process.env.NEXT_PUBLIC_MAPS_URL;
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM;
const FACEBOOK = process.env.NEXT_PUBLIC_FACEBOOK;
const TIKTOK = process.env.NEXT_PUBLIC_TIKTOK;
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;

function SidebarContent({
  categories,
  onClose,
  hasOrder,
}: {
  categories: Category[];
  onClose: () => void;
  hasOrder: boolean;
}) {
  const [search, setSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!search || search.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const socials = [
    {
      key: "facebook",
      href: FACEBOOK,
      label: "Facebook",
      color: "#1877F2",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12.07h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.89h-2.33V21.95C20.343 21.2 24 17.062 24 12.073z" />
        </svg>
      ),
    },
    {
      key: "instagram",
      href: INSTAGRAM,
      label: "Instagram",
      color: "#000000",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: "whatsapp",
      href: WHATSAPP ? `https://wa.me/${WHATSAPP.replace(/\D/g, "")}` : null,
      label: "WhatsApp",
      color: "#25D366",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    },
    {
      key: "tiktok",
      href: TIKTOK,
      label: "TikTok",
      color: "#000000",
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.17a8.16 8.16 0 004.77 1.52V7.25a4.85 4.85 0 01-1-.56z" />
        </svg>
      ),
    },
  ].filter((s) => s.href);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header avec logo + fermer */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <Link href="/" onClick={onClose} className="flex items-center gap-3">
          <Image
            src="/logocasadulce.jpg"
            alt="Casa Dulce"
            width={56}
            height={56}
            className="rounded-full object-cover"
            priority
          />
          <span className="font-cormorant text-xl font-semibold text-sage-800 leading-tight">
            Casa Dulce
          </span>
        </Link>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="px-5 py-3 border-b border-gray-100">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-12 py-2.5 text-sm rounded-full border border-gray-200 bg-white focus:outline-none focus:border-sage-300 placeholder:text-gray-400"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-1 w-9 h-9 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
              aria-label="Effacer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <span className="absolute right-1 w-9 h-9 text-gray-300 flex items-center justify-center pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {/* Résultats de recherche */}
      {search.length >= 2 && (
        <div className="flex-1 overflow-y-auto border-b border-gray-100">
          {searching ? (
            <p className="px-6 py-4 text-sm text-gray-400">Recherche...</p>
          ) : results.length > 0 ? (
            results.map((r) => (
              <Link
                key={r.id}
                href={r.categoryId ? `/menu?cat=${r.categoryId}` : "/menu"}
                onClick={() => { setSearch(""); onClose(); }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors"
              >
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt={r.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-cream-100 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                  <p className="text-xs text-gray-400">{r.categoryName ?? "Menu"}</p>
                </div>
                <span className="text-sm font-medium text-gold-600 flex-shrink-0">
                  {formatPrice(r.price)}
                </span>
              </Link>
            ))
          ) : (
            <p className="px-6 py-4 text-sm text-gray-400">Aucun produit trouvé pour &ldquo;{search}&rdquo;</p>
          )}
        </div>
      )}

      {/* Navigation (masquée pendant la recherche) */}
      <div className={`flex-1 overflow-y-auto ${search.length >= 2 ? "hidden" : ""}`}>
        <nav>
          <Link
            href="/menu"
            onClick={onClose}
            className="block px-6 py-3.5 text-sm text-gray-700 hover:text-sage-800 hover:bg-gray-50 border-b border-gray-100 transition-colors font-medium"
          >
            Menu
          </Link>

          {hasOrder && (
            <Link
              href="/commande/suivi"
              onClick={onClose}
              className="block px-6 py-3.5 text-sm text-sage-700 hover:text-sage-800 hover:bg-gray-50 border-b border-gray-100 transition-colors font-medium"
            >
              Suivre ma commande
            </Link>
          )}

          {/* Catégories accordéon */}
          <button
            onClick={() => setCatOpen(!catOpen)}
            className="flex items-center justify-between w-full px-6 py-3.5 text-sm text-gray-700 hover:text-sage-800 hover:bg-gray-50 border-b border-gray-100 transition-colors font-medium"
          >
            Catégories
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {catOpen && (
            <>
              {categories.map((cat: Category) => (
                <Link
                  key={cat.id}
                  href={`/menu?cat=${cat.id}`}
                  onClick={onClose}
                  className="block pl-10 pr-6 py-3 text-sm text-gray-500 hover:text-sage-800 hover:bg-gray-50 border-b border-gray-100 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </>
          )}

          <Link
            href="/boutique"
            onClick={onClose}
            className="block px-6 py-3.5 text-sm text-gray-700 hover:text-sage-800 hover:bg-gray-50 border-b border-gray-100 transition-colors font-medium"
          >
            Boutique
          </Link>
        </nav>
      </div>

      {/* Bas : adresse + réseaux */}
      <div className="border-t border-gray-100 px-5 py-4 space-y-3">
        {(ADDRESS || MAPS_URL) && (
          <a
            href={MAPS_URL ?? `https://maps.google.com?q=${encodeURIComponent(ADDRESS ?? "")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-sage-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Adresse</span>
          </a>
        )}
        {PHONE && (
          <a href={`tel:${PHONE}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-sage-800 transition-colors">
            <svg className="w-3.5 h-3.5 flex-shrink-0 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {PHONE}
          </a>
        )}
        {socials.length > 0 && (
          <div className="flex items-center justify-center gap-5 pt-1">
            {socials.map((s) => (
              <a
                key={s.key}
                href={s.href!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{ color: s.color }}
                className="hover:opacity-70 transition-opacity"
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomeSidebar() {
  const [hasOrder, setHasOrder] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { isOpen, close } = useSidebarStore();
  const pathname = usePathname();

  // Ferme le sidebar à chaque changement de page
  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    const has = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith("cd_order_hint="));
    setHasOrder(has);
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      {/* Drawer — slide depuis la gauche */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent categories={categories} onClose={close} hasOrder={hasOrder} />
      </aside>
    </>
  );
}
