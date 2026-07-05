"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  MODE_LABELS,
  ALL_STATUSES,
  ALL_MODES,
} from "@/lib/order-constants";
import { formatPrice, formatDate } from "@/lib/utils";
import { usePusherChannel } from "@/hooks/usePusher";

export interface OrderRow {
  id: number;
  number: string;
  customerName: string;
  phone: string;
  mode: string;
  status: string;
  total: number;
  createdAt: string;
  items: { id: number }[];
}

const DATE_FILTERS = [
  { value: "all", label: "Tout" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "7 jours" },
] as const;

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isWithinWeek(dateStr: string) {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return d >= cutoff;
}

interface Props {
  initialOrders: OrderRow[];
}

export default function OrdersTable({ initialOrders }: Props) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [localStatuses, setLocalStatuses] = useState<Record<number, string>>(
    () => Object.fromEntries(initialOrders.map((o) => [o.id, o.status]))
  );
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    if (!("Notification" in window)) {
      setNotifPermission("unsupported");
      return;
    }
    setNotifPermission(Notification.permission);
    if (Notification.permission === "default") {
      Notification.requestPermission().then((p) => setNotifPermission(p));
    }
  }, []);

  function testNotification() {
    if (!("Notification" in window)) return alert("Notifications non supportées par ce navigateur.");
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((p) => {
        setNotifPermission(p);
        if (p === "granted") new Notification("Casa Dulce — Test", { body: "Les notifications fonctionnent !", icon: "/logocasadulce.png" });
        else alert("Permission refusée. Active les notifications dans les paramètres du navigateur.");
      });
      return;
    }
    new Notification("Casa Dulce — Test", { body: "Les notifications fonctionnent !", icon: "/logocasadulce.png" });
  }

  usePusherChannel<{ number: string; customerName: string; total: number; mode: string }>(
    "orders",
    "new-order",
    (data) => {
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        new Notification("Nouvelle commande — Casa Dulce", {
          body: `#${data.number} · ${data.customerName} · ${MODE_LABELS[data.mode] ?? data.mode} · ${formatPrice(data.total)}`,
          icon: "/logocasadulce.png",
        });
      }
      router.refresh();
    }
  );

  const filtered = useMemo(() => {
    return initialOrders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (modeFilter && o.mode !== modeFilter) return false;
      if (dateFilter === "today" && !isToday(o.createdAt)) return false;
      if (dateFilter === "week" && !isWithinWeek(o.createdAt)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.customerName.toLowerCase().includes(q) &&
          !o.phone.includes(q) &&
          !o.number.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [initialOrders, statusFilter, modeFilter, dateFilter, search]);

  const allSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected((s) => {
        const next = new Set(s);
        filtered.forEach((o) => next.delete(o.id));
        return next;
      });
    } else {
      setSelected((s) => {
        const next = new Set(s);
        filtered.forEach((o) => next.add(o.id));
        return next;
      });
    }
  }

  function toggleOne(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function updateStatus(orderId: number, newStatus: string) {
    setUpdatingId(orderId);
    setLocalStatuses((prev) => ({ ...prev, [orderId]: newStatus }));
    await fetch(`/api/commandes/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdatingId(null);
    router.refresh();
  }

  async function deleteSelected() {
    if (!confirm(`Supprimer ${selected.size} commande${selected.size > 1 ? "s" : ""} ? Cette action est irréversible.`)) return;
    setDeleting(true);
    await fetch("/api/commandes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    setSelected(new Set());
    setDeleting(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Filters + actions */}
      <div className="bg-white rounded-2xl border border-sage-100 p-4 flex flex-wrap gap-3 items-center">
        {/* Date tabs */}
        <div className="flex rounded-lg overflow-hidden border border-sage-100">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                dateFilter === f.value
                  ? "bg-sage-400 text-white"
                  : "text-gray-500 hover:bg-sage-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-sage-100 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white"
        >
          <option value="">Tous les statuts</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        <select
          value={modeFilter}
          onChange={(e) => setModeFilter(e.target.value)}
          className="text-sm border border-sage-100 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-sage-300 bg-white"
        >
          <option value="">Tous les modes</option>
          {ALL_MODES.map((m) => (
            <option key={m} value={m}>{MODE_LABELS[m]}</option>
          ))}
        </select>

        <div className="flex-1 min-w-[180px]">
          <input
            type="text"
            placeholder="Rechercher par nom, tél, #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border border-sage-100 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-300 placeholder:text-gray-300"
          />
        </div>

        <span className="text-xs text-gray-400">
          {filtered.length} commande{filtered.length !== 1 ? "s" : ""}
        </span>

        {/* Bouton test notification */}
        <button
          onClick={testNotification}
          title={notifPermission === "granted" ? "Notifications actives" : "Cliquer pour activer les notifications"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            notifPermission === "granted"
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : notifPermission === "denied"
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-gray-50 text-gray-500 hover:bg-gray-100"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${notifPermission === "granted" ? "bg-green-500" : notifPermission === "denied" ? "bg-red-500" : "bg-gray-400"}`} />
          {notifPermission === "granted" ? "Notifs actives" : notifPermission === "denied" ? "Notifs bloquées" : "Activer notifs"}
        </button>

        {/* Bouton supprimer (visible si sélection) */}
        {someSelected && (
          <button
            onClick={deleteSelected}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-medium ml-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting ? "Suppression..." : `Supprimer (${selected.size})`}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-sage-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            Aucune commande trouvée
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-sage-100 bg-cream-50">
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-sage-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Mode</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-50">
                {filtered.map((order) => {
                  const isSelected = selected.has(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors ${isSelected ? "bg-red-50" : "hover:bg-cream-50"}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(order.id)}
                          className="w-4 h-4 accent-sage-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-sage-700">#{order.number}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{order.customerName}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{order.phone}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-gray-500">{MODE_LABELS[order.mode] ?? order.mode}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gold-600 hidden sm:table-cell">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={localStatuses[order.id] ?? order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sage-300 disabled:opacity-60 ${STATUS_COLORS[localStatuses[order.id] ?? order.status]}`}
                        >
                          {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="text-xs font-medium text-sage-600 hover:text-sage-800 transition-colors"
                        >
                          Voir →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
