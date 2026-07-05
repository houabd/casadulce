"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Horaire = {
  id: number;
  day: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  note: string | null;
};

export default function HorairesManager({
  horaires: initial,
  dayLabels,
}: {
  horaires: Horaire[];
  dayLabels: Record<string, string>;
}) {
  const [horaires, setHoraires] = useState(initial);
  const [saving, setSaving] = useState<number | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [error, setError] = useState<number | null>(null);

  function update(id: number, patch: Partial<Horaire>) {
    setHoraires((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }

  async function save(h: Horaire) {
    setSaving(h.id);
    setError(null);
    try {
      const res = await fetch(`/api/horaires/${h.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOpen: h.isOpen,
          openTime: h.isOpen ? h.openTime : null,
          closeTime: h.isOpen ? h.closeTime : null,
          note: h.note,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[HORAIRES] Erreur sauvegarde:", res.status, data);
        setError(h.id);
        setTimeout(() => setError(null), 3000);
      } else {
        setSaved(h.id);
        setTimeout(() => setSaved(null), 2000);
      }
    } catch {
      setError(h.id);
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-sage-100 overflow-hidden">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-28" />
          <col className="w-20" />
          <col className="w-32" />
          <col className="w-32" />
          <col />
          <col className="w-32" />
        </colgroup>
        <thead className="bg-cream-50 text-xs uppercase tracking-wider text-gray-400">
          <tr>
            <th className="px-4 py-3 text-left">Jour</th>
            <th className="px-4 py-3 text-left">Ouvert</th>
            <th className="px-4 py-3 text-left">Ouverture</th>
            <th className="px-4 py-3 text-left">Fermeture</th>
            <th className="px-4 py-3 text-left">Note</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {horaires.map((h) => (
            <tr key={h.id} className="hover:bg-cream-50">
              <td className="px-4 py-3 font-medium text-gray-800">
                {dayLabels[h.day] ?? h.day}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => update(h.id, { isOpen: !h.isOpen })}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                    h.isOpen ? "bg-sage-400" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 mt-0.5 ml-0.5 rounded-full bg-white shadow transition-transform ${
                      h.isOpen ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              </td>
              <td className="px-4 py-3">
                <input
                  type="time"
                  value={h.openTime ?? ""}
                  disabled={!h.isOpen}
                  onChange={(e) => update(h.id, { openTime: e.target.value || null })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sage-400 disabled:opacity-40"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="time"
                  value={h.closeTime ?? ""}
                  disabled={!h.isOpen}
                  onChange={(e) => update(h.id, { closeTime: e.target.value || null })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sage-400 disabled:opacity-40"
                />
              </td>
              <td className="px-4 py-3">
                <input
                  type="text"
                  value={h.note ?? ""}
                  onChange={(e) => update(h.id, { note: e.target.value || null })}
                  placeholder="Remarque..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </td>
              <td className="px-4 py-3 text-right">
                {error === h.id ? (
                  <span className="text-xs text-red-500 font-medium">Erreur, réessayez</span>
                ) : (
                  <Button
                    size="sm"
                    loading={saving === h.id}
                    onClick={() => save(h)}
                    variant={saved === h.id ? "secondary" : "primary"}
                  >
                    {saved === h.id ? "✓ Sauvé" : "Sauvegarder"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
