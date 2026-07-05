"use client";

import { useState, useRef } from "react";

export default function HeroImageManager({ currentImage }: { currentImage: string }) {
  const [preview, setPreview] = useState<string>(currentImage);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Erreur upload");
      const { url } = await uploadRes.json();

      const saveRes = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "heroImage", value: url }),
      });
      if (!saveRes.ok) throw new Error("Erreur sauvegarde");

      setPreview(url);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-sage-100 p-6 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-sage-800 mb-1">Image Hero (page d'accueil)</h2>
        <p className="text-sm text-gray-400">Cette image s'affiche en fond de la section principale de l'accueil.</p>
      </div>

      {/* Aperçu */}
      <div
        className="relative w-full h-52 rounded-xl overflow-hidden border border-sage-100 bg-cover bg-center"
        style={{ backgroundImage: `url('${preview}')` }}
      >
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="font-cormorant text-3xl font-semibold">Casa Dulce</p>
            <p className="text-xs tracking-widest uppercase text-white/70 mt-1">Aperçu</p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-sage-600 text-white text-sm rounded-xl hover:bg-sage-700 transition-colors disabled:opacity-50 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploading ? "Envoi en cours..." : "Changer l'image"}
        </button>

        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ Image mise à jour</span>
        )}
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    </div>
  );
}
