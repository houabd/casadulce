const MAPS_LINK = "https://maps.app.goo.gl/W4KwUuqZmoRMFRK9A";

export default function BoutiquePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      {/* Colonne gauche — infos */}
      <div className="flex flex-col justify-center px-10 py-16 lg:w-[420px] lg:shrink-0 space-y-10">
        <div>
          <h1 className="font-cormorant text-5xl font-semibold text-gray-900 leading-tight mb-3">
            Contactez&#8209;nous
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Nous serons ravis de répondre à vos questions.
          </p>
        </div>

        <div className="w-12 border-t border-sage-200" />

        {/* Téléphones */}
        <div className="space-y-5">
          <a href="tel:0540441366" className="flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sage-100 transition-colors">
              <svg className="w-5 h-5 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-2xl font-semibold text-sage-700 tracking-wide group-hover:text-sage-900 transition-colors">
              05 40 44 13 66
            </span>
          </a>

          <a href="tel:0797782888" className="flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sage-100 transition-colors">
              <svg className="w-5 h-5 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="text-2xl font-semibold text-sage-700 tracking-wide group-hover:text-sage-900 transition-colors">
              07 97 78 28 88
            </span>
          </a>
        </div>

        <div className="w-12 border-t border-sage-200" />

        <a
          href={MAPS_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-sage-700 transition-colors"
        >
          <svg className="w-4 h-4 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ouvrir dans Google Maps
        </a>
      </div>

      {/* Colonne droite — carte Google Maps */}
      <div className="flex-1 min-h-[400px] lg:min-h-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3196.800293015841!2d5.0751113!3d36.7513644!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f2cd00369234b9%3A0xb620104ddc76febb!2sCasa%20Dulce!5e0!3m2!1sfr!2sdz!4v1783191394157!5m2!1sfr!2sdz"
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: "400px" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Casa Dulce — localisation"
        />
      </div>
    </main>
  );
}
