export const STATUS_LABELS: Record<string, string> = {
  NOUVELLE: "Nouvelle",
  CONFIRMEE: "Confirmée",
  PRETE: "Prête",
  LIVREE: "Livrée",
  ANNULEE: "Annulée",
};

export const STATUS_COLORS: Record<string, string> = {
  NOUVELLE: "bg-amber-100 text-amber-800",
  CONFIRMEE: "bg-blue-100 text-blue-700",
  PRETE: "bg-green-100 text-green-700",
  LIVREE: "bg-gray-100 text-gray-600",
  ANNULEE: "bg-red-100 text-red-700",
};

export const MODE_LABELS: Record<string, string> = {
  SUR_PLACE: "Sur place",
  RETRAIT: "Retrait",
  LIVRAISON: "Livraison",
};

export const STATUS_NEXT: Record<string, { label: string; value: string } | null> = {
  NOUVELLE: { label: "Confirmer", value: "CONFIRMEE" },
  CONFIRMEE: { label: "Marquer prête", value: "PRETE" },
  PRETE: { label: "Marquer livrée", value: "LIVREE" },
  LIVREE: null,
  ANNULEE: null,
};

export const ALL_STATUSES = [
  "NOUVELLE",
  "CONFIRMEE",
  "PRETE",
  "LIVREE",
  "ANNULEE",
] as const;

export const ALL_MODES = ["SUR_PLACE", "RETRAIT", "LIVRAISON"] as const;
