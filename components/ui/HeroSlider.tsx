"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Slide {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  ctaText: string | null;
  ctaLink: string | null;
}

interface Props {
  adminSlides: Slide[];
  openNow: boolean;
  heroImage?: string;
}

export default function HeroSlider({ adminSlides, openNow, heroImage = "/BOUTIQUE.jpg" }: Props) {
  const total = adminSlides.length + 1; // +1 pour le slide statique
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, total]);

  return (
    <section className="relative min-h-[70vh] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full min-h-[70vh]">

        {/* Slide 0 — Hero statique */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 py-16 transition-opacity duration-700 ${
            current === 0 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          {/* Image de fond */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroImage}')` }}
          >
            <div className="absolute inset-0 bg-black/45" />
          </div>

          {/* Contenu */}
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.35em] text-gold-300 mb-4">Bienvenue chez</p>
            <h1 className="font-cormorant text-5xl sm:text-6xl md:text-7xl font-semibold text-white leading-none mb-3">
              Casa Dulce
            </h1>
            <p className="text-white/70 text-sm tracking-widest uppercase mb-6">
              Crêpes · Desserts · Jus frais
            </p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className={`w-2 h-2 rounded-full ${openNow ? "bg-green-400" : "bg-red-400"}`} />
              <span className="text-sm text-white/80">
                {openNow ? "Ouvert maintenant" : "Fermé actuellement"}
              </span>
            </div>
            <Link
              href="/menu"
              className="px-7 py-3 bg-gold-400 text-white rounded-full text-sm font-medium tracking-wide hover:bg-gold-500 transition-colors shadow-sm"
            >
              Découvrir le menu
            </Link>
          </div>
        </div>

        {/* Slides admin */}
        {adminSlides.map((slide, i) => (
          <div
            key={slide.id}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 py-16 transition-opacity duration-700 ${
              current === i + 1 ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Image de fond */}
            {slide.image && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>
            )}
            {!slide.image && (
              <div className="absolute inset-0 bg-gradient-to-b from-sage-100 to-cream-50" />
            )}

            {/* Contenu */}
            <div className="relative z-10">
              <h2
                className={`font-cormorant text-4xl sm:text-5xl md:text-6xl font-semibold leading-tight mb-3 ${
                  slide.image ? "text-white" : "text-sage-800"
                }`}
              >
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p
                  className={`text-sm tracking-widest uppercase mb-6 ${
                    slide.image ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {slide.subtitle}
                </p>
              )}
              {slide.ctaText && slide.ctaLink && (
                <Link
                  href={slide.ctaLink}
                  className="px-7 py-3 bg-gold-400 text-white rounded-full text-sm font-medium tracking-wide hover:bg-gold-500 transition-colors shadow-sm"
                >
                  {slide.ctaText}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contrôles (seulement si plusieurs slides) */}
      {total > 1 && (
        <>
          {/* Flèche gauche */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow transition-colors"
            aria-label="Précédent"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Flèche droite */}
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow transition-colors"
            aria-label="Suivant"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Points de navigation */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  current === i
                    ? "w-6 h-2 bg-sage-600"
                    : "w-2 h-2 bg-sage-300 hover:bg-sage-400"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
