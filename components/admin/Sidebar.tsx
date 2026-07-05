"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/horaires", label: "Horaires" },
  { href: "/admin/slides", label: "Slides Hero" },
  { href: "/admin/qrcode", label: "QR Code" },
  { href: "/menu/print", label: "Menu imprimable", target: "_blank" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 bg-sage-800 flex flex-col h-screen shrink-0 print:hidden">
      <div className="px-5 py-6 border-b border-sage-700">
        <Link href="/" className="block hover:opacity-80 transition-opacity">
          <h1 className="font-cormorant text-xl font-semibold text-gold-400">Casa Dulce</h1>
          <p className="text-xs text-sage-300 mt-0.5">Administration</p>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            target={item.target}
            className={cn(
              "flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors",
              isActive(item.href, item.exact)
                ? "bg-sage-600 text-white"
                : "text-sage-200 hover:bg-sage-700 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-sage-700">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center px-3 py-2.5 w-full rounded-lg text-sm text-sage-300 hover:bg-sage-700 hover:text-white transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
