import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 items-start justify-center bg-[#09090b] px-4">
      <div className="mx-auto my-16 flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#121215] p-8 text-center shadow-2xl">
        <h2 className="display text-4xl tracking-tight text-white">Not found</h2>
        <p className="text-xs leading-relaxed text-zinc-400">
          This item or page isn&apos;t available right now. The menu may have changed. Please go back to the menu.
        </p>
        <Link href="/" className="gold-gradient-btn rounded-xl px-4 py-2 text-xs font-bold shadow-md">
          Back to start
        </Link>
      </div>
    </div>
  );
}
