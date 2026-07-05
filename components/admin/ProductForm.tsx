"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const schema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  price: z.number().positive("Le prix doit être positif"),
  available: z.boolean(),
  isNew: z.boolean(),
  isPopular: z.boolean(),
  categoryIds: z.array(z.number()),
  supplements: z.array(
    z.object({ name: z.string().min(1, "Requis"), price: z.number().min(0) })
  ),
  images: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

type Category = { id: number; name: string };

interface ProductFormProps {
  categories: Category[];
  defaultValues?: Partial<FormData>;
  productId?: number;
}

export default function ProductForm({ categories, defaultValues, productId }: ProductFormProps) {
  const router = useRouter();
  const [uploadingImg, setUploadingImg] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      available: true,
      isNew: false,
      isPopular: false,
      categoryIds: [],
      supplements: [],
      images: [],
      ...defaultValues,
    },
  });

  const { fields: supplementFields, append, remove } = useFieldArray({
    control,
    name: "supplements",
  });

  const images = watch("images");
  const categoryIds = watch("categoryIds");

  function toggleCategory(id: number) {
    const current = categoryIds ?? [];
    if (current.includes(id)) {
      setValue("categoryIds", current.filter((c) => c !== id));
    } else {
      setValue("categoryIds", [...current, id]);
    }
  }

  async function uploadImage(file: File) {
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload échoué");
      const { url } = await res.json();
      setValue("images", [...(images ?? []), url]);
    } catch {
      setServerError("Erreur upload image. Vérifiez la config Cloudinary.");
    } finally {
      setUploadingImg(false);
    }
  }

  function removeImage(index: number) {
    setValue("images", (images ?? []).filter((_, i) => i !== index));
  }

  async function onSubmit(data: FormData) {
    setServerError("");
    const url = productId ? `/api/produits/${productId}` : "/api/produits";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      setServerError(err?.error?.formErrors?.[0] ?? "Erreur serveur");
      return;
    }

    router.push("/admin/produits");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Infos de base */}
      <div className="bg-white rounded-xl border border-sage-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Informations
        </h2>
        <Input
          label="Nom du produit"
          required
          error={errors.name?.message}
          {...register("name")}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-400 placeholder:text-gray-400"
            placeholder="Description du produit..."
            {...register("description")}
          />
        </div>
        <Input
          label="Prix (DA)"
          type="number"
          step="0.01"
          required
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
      </div>

      {/* Photos */}
      <div className="bg-white rounded-xl border border-sage-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Photos</h2>
        <div className="flex flex-wrap gap-3">
          {(images ?? []).map((url, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))}
          <label className="w-20 h-20 rounded-lg border-2 border-dashed border-sage-200 flex flex-col items-center justify-center cursor-pointer hover:border-sage-400 transition-colors">
            {uploadingImg ? (
              <span className="text-xs text-gray-400">...</span>
            ) : (
              <>
                <span className="text-2xl text-sage-300">+</span>
                <span className="text-xs text-gray-400">Photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingImg}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {!process.env.NEXT_PUBLIC_HAS_CLOUDINARY && (
          <p className="text-xs text-amber-600">
            ⚠️ Configurez Cloudinary dans .env.local pour activer l'upload.
          </p>
        )}
      </div>

      {/* Catégories */}
      <div className="bg-white rounded-xl border border-sage-100 p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Catégories
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const selected = (categoryIds ?? []).includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selected
                    ? "bg-sage-400 text-white border-sage-400"
                    : "bg-white text-gray-600 border-gray-200 hover:border-sage-300"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
          {categories.length === 0 && (
            <p className="text-sm text-gray-400">Aucune catégorie — créez-en d'abord.</p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl border border-sage-100 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Options</h2>
        {(
          [
            { field: "available" as const, label: "Disponible (visible sur le menu)" },
            { field: "isNew" as const, label: "Badge « Nouveau »" },
            { field: "isPopular" as const, label: "Badge « Populaire »" },
          ] as const
        ).map(({ field, label }) => (
          <label key={field} className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-sage-400" {...register(field)} />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      {/* Suppléments */}
      <div className="bg-white rounded-xl border border-sage-100 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Suppléments
          </h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ name: "", price: 0 })}
          >
            + Ajouter
          </Button>
        </div>
        {supplementFields.length === 0 && (
          <p className="text-sm text-gray-400">Aucun supplément</p>
        )}
        <div className="space-y-3">
          {supplementFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Nom (ex: Chantilly)"
                  error={errors.supplements?.[index]?.name?.message}
                  {...register(`supplements.${index}.name`)}
                />
              </div>
              <div className="w-28">
                <Input
                  type="number"
                  placeholder="Prix DA"
                  {...register(`supplements.${index}.price`, {
                    setValueAs: (v: string) => v === "" || v === undefined ? 0 : parseFloat(v) || 0,
                  })}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1 text-red-400 hover:text-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{serverError}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/produits")}
        >
          Annuler
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {productId ? "Enregistrer les modifications" : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}
