'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { WarningIcon } from '@/components/icons';

/** Shared fallback for error.tsx boundaries: a readable message and a way
 *  forward, instead of Next.js's blank "Application error" page. */
export function ErrorScreen({
  error,
  retry,
  homeHref,
  homeLabel,
}: {
  error: Error & { digest?: string };
  retry: () => void;
  homeHref: string;
  homeLabel: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto my-16 flex w-full max-w-sm flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#121215] p-8 text-center shadow-2xl">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
        <WarningIcon className="h-6 w-6" />
      </span>
      <div className="space-y-1.5">
        <h2 className="text-lg font-bold text-zinc-100">Something went wrong</h2>
        <p className="text-xs leading-relaxed text-zinc-400">
          This is usually a brief connection problem. Try again, and if it keeps happening, reload the page.
        </p>
        {error.digest ? <p className="text-[10px] text-zinc-600">Ref: {error.digest}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => retry()}
          className="gold-gradient-btn rounded-xl px-4 py-2 text-xs font-bold shadow-md cursor-pointer"
        >
          Try again
        </button>
        <Link
          href={homeHref}
          className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
