"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface SlideData {
  title: string;
  subtitle: string;
  image: string | null;
  ctaText: string;
  ctaLink: string;
  order: number;
  active: boolean;
}

interface Props {
  defaultValues?: Partial<SlideData>;
  slideId?: number;
}

export default function SlideForm({ defaultValues, slideId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<SlideData>({
    title: "",
    subtitle: "",
    image: null,
    ctaText: "",
    ctaLink: "",
    order: 0,
    active: true,
    ...defaultValues,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field: keyof SlideData, value: string | number | boolean | null) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload échoué");
      const { url } = await res.json();
      set("image", url);
    } catch {
      setError("Erreur upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const url = slideId ? `/api/slides/${slideId}` : "/api/slides";
    const method = slideId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        subtitle: form.subtitle || null,
        ctaText: form.ctaText || null,
        ctaLink: form.ctaLink || null,
      }),
    });

    if (!res.ok) {
      setError("Erreur lors de l'enregistrement");
      setSaving(false);
      return;
    }

    router.push("/admin/slides");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <Input
        label="Titre *"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        placeholder="Nos crêpes signature"
        required
      />

      <Input
        label="Sous-titre"
        value={form.subtitle}
        onChange={(e) => set("subtitle", e.target.value)}
        placeholder="Faites maison chaque jour"
      />

      {/* Photo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Photo</label>
        {form.image && (
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-sage-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image} alt="slide" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => set("image", null)}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}
        <label className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-sage-300 rounded-xl text-sm text-sage-600 hover:bg-sage-50 cursor-pointer transition-colors w-fit">
          {uploading ? "Upload en cours..." : "Choisir une photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadImage(file);
            }}
          />
        </label>
      </div>

      <Input
        label="Texte du bouton"
        value={form.ctaText}
        onChange={(e) => set("ctaText", e.target.value)}
        placeholder="Voir le menu"
      />

      <Input
        label="Lien du bouton"
        value={form.ctaLink}
        onChange={(e) => set("ctaLink", e.target.value)}
        placeholder="/menu"
      />

      <Input
        label="Ordre d'affichage"
        type="number"
        value={String(form.order)}
        onChange={(e) => set("order", Number(e.target.value))}
      />

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
          className="w-4 h-4 accent-sage-600"
        />
        <span className="text-sm font-medium text-gray-700">Slide actif</span>
      </label>

      {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {slideId ? "Enregistrer" : "Créer le slide"}
        </Button>
        <button
          type="button"
          onClick={() => router.push("/admin/slides")}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
