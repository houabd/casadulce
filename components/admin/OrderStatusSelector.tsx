"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_NEXT,
} from "@/lib/order-constants";

interface Props {
  orderId: number;
  initialStatus: string;
}

export default function OrderStatusSelector({ orderId, initialStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nextStep = STATUS_NEXT[status];

  async function updateStatus(newStatus: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/commandes/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      setStatus(newStatus);
      router.refresh();
    } catch {
      setError("Impossible de mettre à jour le statut");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Statut actuel :</span>
        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[status]}`}
        >
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {nextStep && (
          <button
            disabled={loading}
            onClick={() => updateStatus(nextStep.value)}
            className="px-4 py-2 text-sm font-medium bg-sage-400 text-white rounded-lg hover:bg-sage-500 disabled:opacity-60 transition-colors"
          >
            {loading ? "..." : nextStep.label}
          </button>
        )}
        {status !== "ANNULEE" && status !== "LIVREE" && (
          <button
            disabled={loading}
            onClick={() => updateStatus("ANNULEE")}
            className="px-4 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
          >
            {loading ? "..." : "Annuler la commande"}
          </button>
        )}
      </div>
    </div>
  );
}
