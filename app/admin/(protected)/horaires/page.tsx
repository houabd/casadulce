import { prisma } from "@/lib/prisma";
import HorairesManager from "@/components/admin/HorairesManager";

const DAY_LABELS: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

async function getHoraires() {
  const order = Object.keys(DAY_LABELS);
  const horaires = await prisma.openingHours.findMany();
  return horaires.sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
}

export default async function HorairesPage() {
  const horaires = await getHoraires();
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-cormorant text-3xl font-semibold text-sage-800">
        Horaires d'ouverture
      </h1>
      <HorairesManager horaires={horaires} dayLabels={DAY_LABELS} />
    </div>
  );
}
