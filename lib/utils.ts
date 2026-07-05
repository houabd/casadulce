export function formatPrice(price: number): string {
  return `${price.toLocaleString("fr-DZ")} DA`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function padOrderNumber(n: number): string {
  return String(n).padStart(4, "0");
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
