import { prisma } from "@/lib/prisma";
import Link from "next/link";
import HeroSlider from "@/components/ui/HeroSlider";
import ProductCard from "@/components/menu/ProductCard";

const DAY_LABELS: Record<string, string> = {
  LUNDI: "Lundi",
  MARDI: "Mardi",
  MERCREDI: "Mercredi",
  JEUDI: "Jeudi",
  VENDREDI: "Vendredi",
  SAMEDI: "Samedi",
  DIMANCHE: "Dimanche",
};

const DAY_ORDER = [
  "SAMEDI",
  "DIMANCHE",
  "LUNDI",
  "MARDI",
  "MERCREDI",
  "JEUDI",
  "VENDREDI",
];

function getTodayKey(): string {
  const map = [
    "DIMANCHE",
    "LUNDI",
    "MARDI",
    "MERCREDI",
    "JEUDI",
    "VENDREDI",
    "SAMEDI",
  ];
  return map[new Date().getDay()];
}

function isOpenNow(h: {
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
}): boolean {
  if (!h.isOpen || !h.openTime || !h.closeTime) return false;
  const now = new Date();
  const current = `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  // Horaires passant minuit (ex: 14:00–03:00)
  if (h.closeTime < h.openTime) {
    return current >= h.openTime || current <= h.closeTime;
  }
  return current >= h.openTime && current <= h.closeTime;
}

interface HoraireGroupe {
  startDay: string;
  endDay: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  note: string | null;
}

function grouperHoraires(
  sorted: {
    day: string;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
    note: string | null;
  }[]
): HoraireGroupe[] {
  const groups: HoraireGroupe[] = [];
  for (const h of sorted) {
    const last = groups[groups.length - 1];
    const memeHoraire =
      last &&
      last.isOpen === h.isOpen &&
      last.openTime === h.openTime &&
      last.closeTime === h.closeTime &&
      last.note === h.note;
    if (memeHoraire) {
      last.endDay = h.day;
    } else {
      groups.push({
        startDay: h.day,
        endDay: h.day,
        isOpen: h.isOpen,
        openTime: h.openTime,
        closeTime: h.closeTime,
        note: h.note,
      });
    }
  }
  return groups;
}

function groupeContientJour(groupe: HoraireGroupe, day: string): boolean {
  const start = DAY_ORDER.indexOf(groupe.startDay);
  const end = DAY_ORDER.indexOf(groupe.endDay);
  const current = DAY_ORDER.indexOf(day);
  return current >= start && current <= end;
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [horaires, adminSlides, featuredProducts] = await Promise.all([
    prisma.openingHours.findMany(),
    prisma.heroSlide.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.product.findMany({
      where: { available: true, OR: [{ isPopular: true }, { isNew: true }] },
      include: {
        supplements: true,
        categories: { select: { categoryId: true } },
      },
      orderBy: [{ isPopular: "desc" }, { createdAt: "desc" }],
      take: 8,
    }),
  ]);

  let heroImage = "/BOUTIQUE.jpg";
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = await (prisma as any).siteSetting?.findUnique({ where: { key: "heroImage" } });
    if (s?.value) heroImage = s.value;
  } catch { /* modèle pas encore chargé */ }

  const todayKey = getTodayKey();
  const todayHoraire = horaires.find((h) => h.day === todayKey);
  const openNow = todayHoraire ? isOpenNow(todayHoraire) : false;

  const sorted = [...horaires].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );
  const groupes = grouperHoraires(sorted);

  return (
    <div className="flex-1">
      {/* Contenu principal */}
      <div>
        {/* Hero Slider */}
        <HeroSlider adminSlides={adminSlides} openNow={openNow} heroImage={heroImage} />

        {/* Produits vedettes */}
        {featuredProducts.length > 0 && (
          <section className="py-14 px-4 bg-cream-50">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold-500 mb-1">À la carte</p>
                  <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-sage-800">
                    Nos incontournables
                  </h2>
                </div>
                <Link
                  href="/menu"
                  className="text-sm text-sage-600 hover:text-sage-800 transition-colors underline underline-offset-4"
                >
                  Voir tout le menu
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id,
                      name: p.name,
                      description: p.description,
                      price: p.price,
                      images: p.images,
                      isNew: p.isNew,
                      isPopular: p.isPopular,
                      categoryIds: p.categories.map((c) => c.categoryId),
                      supplements: p.supplements,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Horaires */}
        <section className="bg-white border-y border-sage-100 py-16">
          <div className="max-w-lg mx-auto px-4">
            <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-sage-800 text-center mb-8">
              Horaires d&apos;ouverture
            </h2>
            <div className="space-y-1">
              {groupes.map((g) => {
                const isToday = groupeContientJour(g, todayKey);
                const ouvert = isToday && isOpenNow(g);
                const label =
                  g.startDay === g.endDay
                    ? DAY_LABELS[g.startDay]
                    : `${DAY_LABELS[g.startDay]} – ${DAY_LABELS[g.endDay]}`;
                return (
                  <div
                    key={g.startDay}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                      isToday
                        ? "bg-sage-400 text-white"
                        : "hover:bg-cream-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`font-medium text-sm ${isToday ? "text-white" : ""}`}>
                        {label}
                      </span>
                      {isToday && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            ouvert
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {ouvert ? "Ouvert" : "Fermé"}
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      {g.isOpen && g.openTime && g.closeTime ? (
                        <span className={`text-sm ${isToday ? "text-white/90" : "text-gray-500"}`}>
                          {g.openTime} – {g.closeTime}
                        </span>
                      ) : (
                        <span className={`text-sm ${isToday ? "text-white/60" : "text-gray-300"}`}>
                          Fermé
                        </span>
                      )}
                      {g.note && (
                        <p className={`text-xs italic mt-0.5 ${isToday ? "text-white/70" : "text-gray-400"}`}>
                          {g.note}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
