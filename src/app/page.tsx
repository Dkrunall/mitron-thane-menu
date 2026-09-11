import Link from 'next/link';
import Image from 'next/image';

const FEATURE_CHIPS = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    label: 'Live Kitchen',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
        <path d="M8 22h8" />
        <path d="M12 15v7" />
        <path d="m19 3-7 8-7-8Z" />
      </svg>
    ),
    label: 'Cocktails',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: 'Rooftop',
  },
];

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ table?: string }>;
}) {
  const params = await searchParams;
  const tableParam = params?.table;
  const tableNumber = tableParam ? parseInt(tableParam, 10) : 4;
  const displayTable = tableParam
    ? `TABLE ${tableParam.length === 1 ? `0${tableParam}` : tableParam}`
    : 'TABLE 04';

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#09090b]">
      {/* Full-bleed hero photo of the Mitron rooftop terrace */}
      <Image
        src="/hero-rooftop.jpg"
        alt="Mitron Thane Rooftop"
        fill
        sizes="100vw"
        className="object-cover object-[68%_top] sm:object-center"
        priority
      />

      {/* Atmospheric lighting gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/30 to-[#09090b]" />
      <div className="absolute inset-x-0 bottom-0 h-[68vh] bg-gradient-to-t from-[#09090b] via-[#09090b]/85 to-transparent" />
      {/* Soft twilight violet/magenta ambient glow */}
      <div className="pointer-events-none absolute -left-12 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(219,39,119,0.32),transparent_70%)] blur-2xl" />

      {/* Floating top bar */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 pt-6 sm:px-6">
        <span className="glass-pill flex items-center gap-2 rounded-full px-3.5 py-1.5 backdrop-blur-md bg-white/[0.08] border border-white/15 shadow-sm">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[11px] font-bold tracking-wider text-zinc-100">{displayTable}</span>
        </span>

        <span className="glass-pill flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md bg-white/[0.08] border border-white/15 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-[#22c55e] shadow-[0_0_10px_#22c55e,0_0_4px_#22c55e]" />
        </span>
      </div>

      {/* Main hero content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-end px-6 pb-6 text-center">
        {/* Mitron circular brand badge */}
        <div className="animate-float-y mb-3.5">
          <div className="relative h-20 w-20 overflow-hidden rounded-full shadow-[0_10px_28px_rgba(0,0,0,0.6),0_0_0_2px_rgba(255,255,255,0.08)] sm:h-24 sm:w-24">
            <Image
              src="/mitron-logo.png"
              alt="Mitron Thane"
              fill
              sizes="96px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Condensed bold headline */}
        <h1 className="display text-6xl leading-none tracking-tight text-white sm:text-7xl">
          MITRON
        </h1>

        {/* Flanked subheader */}
        <div className="mt-2 mb-3.5 flex items-center gap-2.5">
          <span className="h-[1px] w-7 bg-gradient-to-r from-transparent to-[#f97316] opacity-75" />
          <span className="text-[11px] font-bold tracking-[0.32em] text-[#f97316]">
            THANE ROOFTOP
          </span>
          <span className="h-[1px] w-7 bg-gradient-to-l from-transparent to-[#d946ef] opacity-75" />
        </div>

        {/* Brand description */}
        <p className="max-w-[280px] text-[13px] leading-relaxed text-zinc-200/90 sm:text-sm">
          Global plates, signature cocktails &amp; a skyline to match. Order straight from your table.
        </p>

        {/* Feature chips */}
        <div className="mt-5 flex w-full items-center justify-center gap-2">
          {FEATURE_CHIPS.map((chip) => (
            <span
              key={chip.label}
              className="glass-pill flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/[0.12] shadow-sm whitespace-nowrap"
            >
              {chip.icon}
              <span className="text-[11px] font-bold tracking-tight text-zinc-100">{chip.label}</span>
            </span>
          ))}
        </div>

        {/* Action CTA Button */}
        <Link
          href={`/order?table=${tableNumber}`}
          className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[linear-gradient(90deg,#ff6830_0%,#ef3b50_55%,#db2777_100%)] py-4 px-6 shadow-[0_12px_36px_rgba(239,59,80,0.45)] transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
        >
          <span className="text-[15px] sm:text-base font-extrabold tracking-wide text-zinc-950">
            View the menu
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-950 transition-transform group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>

        {/* Downward scroll indicator */}
        <div className="animate-bob-y mt-4 flex justify-center text-zinc-500/80">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
