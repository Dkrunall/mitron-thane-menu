import Link from 'next/link';
import Image from 'next/image';

const FEATURE_CHIPS = [
  { emoji: '⚡', label: 'Live Kitchen' },
  { emoji: '🍸', label: 'Cocktails' },
  { emoji: '🌆', label: 'Rooftop' },
  { emoji: '🛎️', label: 'Table Service' },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#09090b]">
      {/* Full-bleed hero photo */}
      <Image
        src="/mitron-hero.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-[#09090b]" />
      <div className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-[#09090b] via-[#09090b]/70 to-transparent" />
      <div className="pointer-events-none absolute -left-10 top-28 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(233,1,151,0.35),transparent_70%)] blur-md" />

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-6 sm:px-6">
        <span className="glass-pill flex items-center gap-2 rounded-full px-3.5 py-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mitron-flame)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 2v4M16 2v4" />
          </svg>
          <span className="text-[11px] font-bold tracking-wider text-zinc-100">SCAN &amp; ORDER</span>
        </span>
        <span className="glass-pill flex h-9 w-9 items-center justify-center rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#22c55e]" />
        </span>
      </div>

      {/* Bottom content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-end px-6 pb-9 text-center">
        <div className="animate-float-y mb-3.5">
          <div className="relative h-20 w-20 overflow-hidden rounded-full shadow-[0_0_0_3px_rgba(230,64,26,0.7),0_12px_34px_rgba(230,64,26,0.35)] sm:h-24 sm:w-24">
            <Image src="/mitron-logo.png" alt="Mitron Thane" fill sizes="96px" className="object-cover" priority />
          </div>
        </div>

        <h1 className="display text-6xl leading-none text-zinc-50 sm:text-7xl">MITRON</h1>
        <div className="mt-2 mb-3.5 flex items-center gap-2.5">
          <span className="h-px w-7 bg-gradient-to-r from-transparent to-[var(--mitron-flame)]" />
          <span className="text-[11px] font-bold tracking-[0.32em] text-[var(--mitron-flame)]">THANE ROOFTOP</span>
          <span className="h-px w-7 bg-gradient-to-l from-transparent to-[var(--mitron-pink)]" />
        </div>
        <p className="max-w-[280px] text-sm leading-relaxed text-zinc-300">
          Global plates, signature cocktails &amp; a skyline to match. Order straight from your table.
        </p>

        {/* Feature chips */}
        <div className="no-scrollbar mt-6 flex w-full justify-center gap-2.5 overflow-x-auto pb-1">
          {FEATURE_CHIPS.map((chip) => (
            <span key={chip.label} className="glass-pill flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2.5">
              <span className="text-sm">{chip.emoji}</span>
              <span className="text-[11px] font-semibold text-zinc-200">{chip.label}</span>
            </span>
          ))}
        </div>

        <Link
          href="/order?table=1"
          className="animate-cta-glow mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[linear-gradient(120deg,#ff8a3d_0%,#e6401a_55%,#e90197_130%)] py-[1.05rem] px-5 shadow-[0_10px_30px_-6px_rgba(230,64,26,0.55)] transition-transform active:scale-[0.97]"
        >
          <span className="text-[15px] font-black tracking-wide text-black">View the menu</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>

        <div className="animate-bob-y mt-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b6864" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
