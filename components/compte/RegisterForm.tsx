"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Nom requis (min. 2 caractères)"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(/^\d{10}$/, "Numéro à 10 chiffres"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    const res = await fetch("/api/auth/customer/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(typeof err.error === "string" ? err.error : "Erreur d'inscription");
      return;
    }

    router.push("/compte/mes-commandes");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="hover:opacity-75 transition-opacity inline-block">
            <h1 className="font-cormorant text-4xl font-semibold text-sage-800">
              Casa Dulce
            </h1>
          </Link>
          <p className="text-sm text-gray-400 mt-2">Créer un compte</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 space-y-4"
        >
          <Input
            label="Nom complet"
            required
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Téléphone"
            type="tel"
            required
            maxLength={10}
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Mot de passe"
            type="password"
            required
            error={errors.password?.message}
            {...register("password")}
          />

          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {serverError}
            </p>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full">
            Créer mon compte
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Déjà un compte ?{" "}
          <Link href="/compte/login" className="text-sage-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
