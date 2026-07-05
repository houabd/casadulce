"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, MODE_LABELS } from "@/lib/order-constants";
import { usePusherChannel } from "@/hooks/usePusher";

interface Supplement {
  name: string;
  price: number;
}

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  supplements: Supplement[];
}

export interface CustomerOrder {
  id: number;
  number: string;
  status: string;
  mode: string;
  total: number;
  note: string | null;
  address: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface StatusUpdate {
  id: number;
  status: string;
}

interface Props {
  initialOrders: CustomerOrder[];
  customerId: number;
  customerName: string;
}

export default function MesCommandesClient({
  initialOrders,
  customerId,
  customerName,
}: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  // Mise à jour en temps réel du statut
  const handleStatusUpdate = useCallback((data: StatusUpdate) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === data.id ? { ...o, status: data.status } : o))
    );
  }, []);

  usePusherChannel<StatusUpdate>(
    `customer-${customerId}`,
    "order-status-update",
    handleStatusUpdate
  );

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/customer/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cormorant text-3xl font-semibold text-sage-800">
            Mes commandes
          </h1>
          <p className="text-sm text-gray-400 mt-1">Bonjour, {customerName}</p>
        </div>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          Déconnexion
        </button>
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sage-100 p-12 text-center space-y-3">
          <p className="text-gray-400">Aucune commande pour le moment</p>
          <a
            href="/menu"
            className="inline-block px-5 py-2 bg-sage-400 text-white rounded-full text-sm font-medium hover:bg-sage-500 transition-colors"
          >
            Découvrir le menu
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-sage-100 overflow-hidden"
            >
              {/* Row header */}
              <button
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-cream-50 transition-colors text-left"
                onClick={() =>
                  setExpanded(expanded === order.id ? null : order.id)
                }
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sage-700">
                    #{order.number}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[order.status]}`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gold-600">
                    {formatPrice(order.total)}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {formatDate(order.createdAt)}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-300 transition-transform ${
                      expanded === order.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              {expanded === order.id && (
                <div className="border-t border-sage-100 px-5 py-4 space-y-3 bg-cream-50/50">
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-400">Mode : </span>
                      <span className="font-medium text-gray-700">
                        {MODE_LABELS[order.mode] ?? order.mode}
                      </span>
                    </div>
                    {order.address && (
                      <div>
                        <span className="text-gray-400">Adresse : </span>
                        <span className="font-medium text-gray-700">
                          {order.address}
                        </span>
                      </div>
                    )}
                    <div className="sm:hidden w-full">
                      <span className="text-gray-400">Date : </span>
                      <span className="font-medium text-gray-700">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 text-sm"
                      >
                        <div>
                          <span className="font-medium text-gray-800">
                            {item.quantity} × {item.productName}
                          </span>
                          {item.supplements.length > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              + {item.supplements.map((s) => s.name).join(", ")}
                            </p>
                          )}
                        </div>
                        <span className="text-gold-600 whitespace-nowrap">
                          {formatPrice(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.note && (
                    <p className="text-xs text-gray-400 italic border-t border-sage-100 pt-2">
                      Note : {order.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
