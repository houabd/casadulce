import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-cream-50">
      <p className="font-cormorant text-8xl font-semibold text-sage-200 mb-4">404</p>
      <h1 className="font-cormorant text-3xl font-semibold text-sage-800 mb-2">
        Page introuvable
      </h1>
      <p className="text-gray-400 text-sm mb-8 max-w-xs">
        Cette page n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/menu"
        className="px-7 py-3 bg-sage-400 text-white rounded-full text-sm font-medium tracking-wide hover:bg-sage-500 transition-colors shadow-sm"
      >
        Voir le menu
      </Link>
    </div>
  );
}
