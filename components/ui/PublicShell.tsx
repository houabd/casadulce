"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import CartDrawer from "@/components/menu/CartDrawer";
import HomeSidebar from "./HomeSidebar";

export default function PublicShell() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <Navbar />
      <CartDrawer />
      <HomeSidebar />
    </>
  );
}
