import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [commandesAujourd, commandesParStatut, caJour, produitsRupture] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { createdAt: { gte: today } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: today },
        status: { notIn: ["ANNULEE"] },
      },
    }),
    prisma.product.count({ where: { available: false } }),
  ]);

  return { commandesAujourd, commandesParStatut, caJour, produitsRupture };
}

const statusLabels: Record<string, { label: string; variant: "blue" | "gold" | "green" | "gray" | "red" }> = {
  NOUVELLE: { label: "Nouvelles", variant: "blue" },
  CONFIRMEE: { label: "Confirmées", variant: "gold" },
  PRETE: { label: "Prêtes", variant: "green" },
  LIVREE: { label: "Livrées", variant: "sage" as "gray" },
  ANNULEE: { label: "Annulées", variant: "red" },
};

export default async function DashboardPage() {
  const { commandesAujourd, commandesParStatut, caJour, produitsRupture } = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="font-cormorant text-3xl font-semibold text-sage-800">Dashboard</h1>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Commandes aujourd'hui"
          value={String(commandesAujourd)}
          icon="📋"
          color="blue"
        />
        <StatCard
          title="CA du jour"
          value={formatPrice(caJour._sum.total ?? 0)}
          icon="💰"
          color="gold"
        />
        <StatCard
          title="Produits en rupture"
          value={String(produitsRupture)}
          icon="⚠️"
          color={produitsRupture > 0 ? "red" : "green"}
        />
      </div>

      {/* Commandes par statut */}
      {commandesParStatut.length > 0 && (
        <div className="bg-white rounded-xl border border-sage-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Répartition des commandes
          </h2>
          <div className="flex flex-wrap gap-3">
            {commandesParStatut.map((s) => {
              const info = statusLabels[s.status] ?? { label: s.status, variant: "gray" };
              return (
                <div key={s.status} className="flex items-center gap-2">
                  <Badge variant={info.variant}>{info.label}</Badge>
                  <span className="text-sm font-semibold text-gray-700">{s._count.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {commandesParStatut.length === 0 && (
        <div className="bg-white rounded-xl border border-sage-100 p-12 text-center">
          <p className="text-4xl mb-3">🌙</p>
          <p className="text-gray-500">Aucune commande aujourd'hui pour l'instant</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: string;
  color: "blue" | "gold" | "green" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    gold: "bg-amber-50 text-amber-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl border border-sage-100 p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg ${colors[color]}`}>
          {icon}
        </span>
        <p className="text-sm text-gray-500">{title}</p>
      </div>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  );
}
