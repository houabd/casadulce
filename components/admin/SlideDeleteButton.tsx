"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SlideDeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer ce slide ?")) return;
    setLoading(true);
    await fetch(`/api/slides/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Supprimer"}
    </button>
  );
}
