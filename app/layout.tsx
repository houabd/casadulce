import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import PublicShell from "@/components/ui/PublicShell";
import PublicFooter from "@/components/ui/PublicFooter";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casa Dulce — Crêpes, Desserts & Jus",
  description:
    "Boutique de crêpes, desserts et jus frais. Commandez en ligne ou sur place.",
  icons: {
    icon: { url: "/faviconecasa.png", type: "image/png" },
    apple: { url: "/faviconecasa.png", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-gray-800">
        <PublicShell />
        {children}
        <PublicFooter />
      </body>
    </html>
  );
}
