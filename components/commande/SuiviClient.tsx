"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS, MODE_LABELS } from "@/lib/order-constants";
import { usePusherChannel } from "@/hooks/usePusher";

const STEPS = ["NOUVELLE", "CONFIRMEE", "PRETE", "LIVREE"] as const;

const STEP_LABELS: Record<string, string> = {
  NOUVELLE: "Reçue",
  CONFIRMEE: "Confirmée",
  PRETE: "Prête",
  LIVREE: "Livrée",
};

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

export interface SuiviOrder {
  id: number;
  number: string;
  status: string;
  mode: string;
  address: string | null;
  total: number;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function SuiviClient({ order: initial }: { order: SuiviOrder }) {
  const [status, setStatus] = useState(initial.status);

  const handleUpdate = useCallback(
    (data: { id: number; status: string }) => {
      if (data.id === initial.id) setStatus(data.status);
    },
    [initial.id]
  );

  usePusherChannel(`order-${initial.id}`, "order-status-update", handleUpdate);

  const currentStep = STEPS.indexOf(status as (typeof STEPS)[number]);
  const cancelled = status === "ANNULEE";

  return (
    <main className="max-w-lg mx-auto px-4 py-12 space-y-8">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Suivi de commande
        </p>
        <p className="font-cormorant text-6xl font-semibold text-sage-800">
          #{initial.number}
        </p>
        <p className="text-sm text-gray-400">{formatDate(initial.createdAt)}</p>
      </div>

      {/* Statut */}
      <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Statut
          </span>
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[status]}`}
          >
            {STATUS_LABELS[status] ?? status}
          </span>
        </div>

        {cancelled ? (
          <p className="text-sm text-red-400 text-center py-2">
            Cette commande a été annulée.
          </p>
        ) : (
          /* Barre de progression */
          <div className="flex items-center gap-0">
            {STEPS.map((step, i) => {
              const done = currentStep >= i;
              const isLast = i === STEPS.length - 1;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                        done
                          ? "bg-sage-400 text-white"
                          : "bg-gray-100 text-gray-300"
                      }`}
                    >
                      {done ? (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] text-center leading-tight ${
                        done ? "text-sage-600 font-medium" : "text-gray-300"
                      }`}
                    >
                      {STEP_LABELS[step]}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${
                        currentStep > i ? "bg-sage-300" : "bg-gray-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Infos commande */}
      <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Mode</span>
          <span className="font-medium text-gray-800">
            {MODE_LABELS[initial.mode] ?? initial.mode}
          </span>
        </div>
        {initial.address && (
          <div className="flex items-start justify-between text-sm gap-4">
            <span className="text-gray-400 flex-shrink-0">Adresse</span>
            <span className="font-medium text-gray-800 text-right">
              {initial.address}
            </span>
          </div>
        )}

        <div className="border-t border-sage-100 pt-3 space-y-2">
          {initial.items.map((item) => (
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
          <div className="flex items-center justify-between pt-2 border-t border-sage-100">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="font-cormorant text-xl font-semibold text-gold-600">
              {formatPrice(initial.total)}
            </span>
          </div>
        </div>

        {initial.note && (
          <p className="text-xs text-gray-400 italic border-t border-sage-100 pt-3">
            Note : {initial.note}
          </p>
        )}
      </div>

      <p className="text-center text-xs text-gray-300">
        Ce lien est valable 2 heures après la commande
      </p>

      <div className="text-center">
        <Link
          href="/menu"
          className="text-sm text-sage-600 hover:text-sage-800 transition-colors"
        >
          ← Retour au menu
        </Link>
      </div>
    </main>
  );
}
