'use client';

import Image from 'next/image';

/** Compact atmospheric banner + topbar (table number, staff login). */
export function HeroVideoHeader({
  tableNumber,
  children,
}: {
  tableNumber: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative w-full bg-[#09090b] text-white pb-9 mb-2">
      {/* Background image container */}
      <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden rounded-b-[38px] border-b border-white/10 shadow-2xl sm:rounded-b-[48px]">
        <Image
          src="/mitron-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />

        {/* Dark vignette + glow, matching the Neon Rooftop landing hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#09090b]" />
        <div className="pointer-events-none absolute -left-8 top-16 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(233,1,151,0.32),transparent_70%)] blur-md" />
      </div>

      {/* Floating top bar pinned to viewport */}
      {children ? (
        <div className="fixed inset-x-0 top-0 z-40 mx-auto max-w-lg">
          {children}
        </div>
      ) : null}

      {/* Logo positioned with a coral glow ring, floating over the seam */}
      <div className="animate-float-y absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-1/2 z-30">
        <div className="relative h-18 w-18 overflow-hidden rounded-full shadow-[0_0_0_3px_rgba(230,64,26,0.7),0_12px_34px_rgba(230,64,26,0.35)] sm:h-20 sm:w-20">
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
