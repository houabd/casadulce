"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  customerName: z.string().min(2, "Nom requis (min. 2 caractères)"),
  phone: z.string().regex(/^\d{10}$/, "Le numéro doit contenir exactement 10 chiffres"),
  mode: z.enum(["SUR_PLACE", "LIVRAISON"]),
  address: z.string().optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const MODE_LABELS: Record<string, string> = {
  SUR_PLACE: "Dans la boutique",
  LIVRAISON: "Livraison à domicile",
};

export default function OrderForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { mode: "SUR_PLACE" },
  });

  // Pré-remplissage si client connecté
  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((r) => r.json())
      .then((session) => {
        if (!session) return;
        if (session.name) setValue("customerName", session.name);
        if (session.phone) setValue("phone", session.phone);
      })
      .catch(() => {});
  }, [setValue]);

  const mode = watch("mode");

  async function onSubmit(data: FormData) {
    setServerError("");

    if (data.mode === "LIVRAISON" && !data.address?.trim()) {
      setError("address", { message: "Adresse de livraison requise" });
      return;
    }

    const res = await fetch("/api/commandes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: data.customerName,
        phone: data.phone,
        mode: data.mode,
        address: data.address,
        note: data.note,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          supplements: item.supplements.map((s) => ({ name: s.name })),
        })),
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(
        typeof err.error === "string" ? err.error : "Erreur lors de la commande"
      );
      return;
    }

    const { id } = await res.json();
    router.push(`/commande/confirmation?id=${id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Infos client */}
      <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Vos informations
        </h2>
        <Input
          label="Nom complet"
          required
          error={errors.customerName?.message}
          {...register("customerName")}
        />
        <Input
          label="Numéro de téléphone"
          required
          type="tel"
          maxLength={10}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      {/* Mode */}
      <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Mode de récupération
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {(["SUR_PLACE", "LIVRAISON"] as const).map((m) => (
            <label
              key={m}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-colors text-center ${
                mode === m
                  ? "border-sage-400 bg-sage-50 text-sage-800"
                  : "border-gray-100 text-gray-500 hover:border-sage-200"
              }`}
            >
              <input
                type="radio"
                value={m}
                className="sr-only"
                {...register("mode")}
              />
              <span className="text-xs font-medium leading-tight">
                {MODE_LABELS[m]}
              </span>
            </label>
          ))}
        </div>

        {mode === "LIVRAISON" && (
          <Input
            label="Adresse de livraison"
            required
            placeholder="Rue, quartier, ville..."
            error={errors.address?.message}
            {...register("address")}
          />
        )}
      </div>

      {/* Note */}
      <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Note (optionnel)
        </h2>
        <textarea
          rows={3}
          placeholder="Instructions particulières, allergies..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 placeholder:text-gray-400 resize-none"
          {...register("note")}
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
          {serverError}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full py-3">
        Confirmer la commande
      </Button>
    </form>
  );
}
