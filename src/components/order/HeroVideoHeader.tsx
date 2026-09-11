'use client';

import Image from 'next/image';

/** Compact atmospheric banner + topbar (table number, staff login). */
export function HeroVideoHeader({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="relative w-full bg-[#09090b] text-white pb-9 mb-2">
      {/* Background image container */}
      <div className="relative h-[44vh] min-h-[310px] w-full overflow-hidden rounded-b-[38px] border-b border-white/10 shadow-2xl sm:rounded-b-[48px]">
        <Image
          src="/hero-rooftop.jpg"
          alt="Mitron Thane Rooftop"
          fill
          sizes="100vw"
          className="object-cover object-[74%_28%] sm:object-[70%_25%]"
          priority
        />

        {/* Subtle dark vignettes + twilight glow allowing the illuminated archway to shine */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-[#09090b]/90" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent" />
        <div className="pointer-events-none absolute -left-10 top-14 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(219,39,119,0.25),transparent_70%)] blur-xl" />
      </div>

      {/* Floating top bar pinned to viewport */}
      {children ? (
        <div className="fixed inset-x-0 top-0 z-40 mx-auto max-w-lg">
          {children}
        </div>
      ) : null}

      {/* Logo positioned with a coral glow ring, floating over the seam */}
      <div className="animate-float-y absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-1/2 z-30">
        <div className="relative h-18 w-18 overflow-hidden rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_0_2px_rgba(255,255,255,0.1)] sm:h-20 sm:w-20">
          <Image
            src="/mitron-logo.png"
            alt="Mitron Thane logo"
            fill
            sizes="80px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
