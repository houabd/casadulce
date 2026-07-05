import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "gold" | "red" | "gray" | "blue" | "sage";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-700",
  gold: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
  blue: "bg-blue-100 text-blue-700",
  sage: "bg-sage-100 text-sage-700",
};

export default function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
