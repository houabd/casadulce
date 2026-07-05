"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePusherChannel } from "@/hooks/usePusher";
import { MODE_LABELS } from "@/lib/order-constants";
import { formatPrice } from "@/lib/utils";

interface NewOrderPayload {
  id: number;
  number: string;
  customerName: string;
  total: number;
  mode: string;
}

interface Toast {
  uid: number;
  payload: NewOrderPayload;
}

let uid = 0;

function beep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not supported
  }
}

export default function OrderNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.uid !== id));
  }, []);

  const handleNewOrder = useCallback(
    (payload: NewOrderPayload) => {
      const id = ++uid;
      setToasts((prev) => [...prev, { uid: id, payload }]);
      beep();
      setTimeout(() => dismiss(id), 8000);
    },
    [dismiss]
  );

  usePusherChannel<NewOrderPayload>("orders", "new-order", handleNewOrder);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end print:hidden">
      {toasts.map((toast) => (
        <div
          key={toast.uid}
          className="bg-white border border-sage-200 shadow-xl rounded-2xl px-5 py-4 w-72 animate-toast-in"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-1">
                Nouvelle commande
              </p>
              <p className="font-semibold text-sage-800 truncate">
                #{toast.payload.number} — {toast.payload.customerName}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {MODE_LABELS[toast.payload.mode] ?? toast.payload.mode} ·{" "}
                {formatPrice(toast.payload.total)}
              </p>
            </div>
            <button
              onClick={() => dismiss(toast.uid)}
              className="text-gray-300 hover:text-gray-500 flex-shrink-0 mt-0.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <Link
            href={`/admin/commandes/${toast.payload.id}`}
            onClick={() => dismiss(toast.uid)}
            className="mt-3 block text-center text-xs font-medium text-sage-600 hover:text-sage-800 transition-colors py-1.5 border border-sage-200 rounded-lg hover:border-sage-300"
          >
            Voir la commande →
          </Link>
        </div>
      ))}
    </div>
  );
}
