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
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    const res = await fetch("/api/auth/customer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(typeof err.error === "string" ? err.error : "Erreur de connexion");
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
          <p className="text-sm text-gray-400 mt-2">Connexion à votre compte</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 space-y-4"
        >
          <Input
            label="Email"
            type="email"
            required
            error={errors.email?.message}
            {...register("email")}
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
            Se connecter
          </Button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/compte/register" className="text-sage-600 hover:underline">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
