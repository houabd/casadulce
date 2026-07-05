"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";

const HIDE_ON = ["/admin", "/commande", "/compte", "/menu/print"];

export default function PublicFooter() {
  const pathname = usePathname();
  const hidden = HIDE_ON.some((p) => pathname.startsWith(p));
  if (hidden) return null;
  return <SiteFooter />;
}
