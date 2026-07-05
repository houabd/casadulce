"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";

const schema = z.object({
  name: z.string().min(1, "Requis"),
});
type FormData = z.infer<typeof schema>;

type Category = {
  id: number;
  name: string;
  order: number;
  _count: { products: number };
};

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function openCreate() {
    setEditing(null);
    reset({ name: "" });
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    reset({ name: cat.name });
    setModalOpen(true);
  }

  async function onSubmit(data: FormData) {
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return;

    setModalOpen(false);
    router.refresh();
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-sage-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sage-100">
          <p className="text-sm text-gray-500">{categories.length} catégorie(s)</p>
          <Button size="sm" onClick={openCreate}>+ Ajouter</Button>
        </div>

        {categories.length === 0 ? (
          <div className="py-16 text-center text-gray-400">Aucune catégorie</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-cream-50 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-6 py-3 text-left">Nom</th>
                <th className="px-6 py-3 text-left">Produits</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-cream-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-500">{cat._count.products}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                      Modifier
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deleting === cat.id}
                      onClick={() => handleDelete(cat.id)}
                      disabled={cat._count.products > 0}
                      title={cat._count.products > 0 ? "Impossible — produits liés" : ""}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Nom" required error={errors.name?.message} {...register("name")} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
