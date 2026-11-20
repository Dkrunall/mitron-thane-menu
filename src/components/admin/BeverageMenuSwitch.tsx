'use client';

import { useState, useTransition } from 'react';
import { setPartyMenuEnabled } from '@/lib/actions/menu';
import { WarningIcon } from '@/components/icons';

/** Admin switch between the All Day and Party beverage menus. Food is unaffected. */
export function BeverageMenuSwitch({ partyEnabled }: { partyEnabled: boolean }) {
  const [enabled, setEnabled] = useState(partyEnabled);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !enabled;
    setError(null);
    setEnabled(next);
    startTransition(async () => {
      try {
        await setPartyMenuEnabled(next);
      } catch (err) {
        setEnabled(!next);
        setError(err instanceof Error && err.message ? err.message : 'Failed to switch the beverage menu.');
      }
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121215] p-4 sm:p-5 shadow-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xs font-bold tracking-wider text-[#ff8a3d] uppercase">Beverage Menu</h2>
          <p className="mt-1 text-sm font-semibold text-zinc-100">
            Customers now see the{' '}
            <span className={enabled ? 'text-[#e91e63]' : 'text-emerald-400'}>
              {enabled ? 'Party' : 'All Day'} drinks menu
            </span>
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Food stays the same. Turning Party Menu on hides every All Day drink, and turning it off brings them back.
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Party Menu"
          onClick={handleToggle}
          disabled={isPending}
          className="flex shrink-0 items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 transition-all hover:border-white/20 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          <span className="text-sm font-bold text-zinc-100">Party Menu</span>
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-300 ${
              enabled ? 'bg-[linear-gradient(90deg,#ff5722,#e91e63)]' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </span>
          <span className={`w-7 text-xs font-extrabold ${enabled ? 'text-[#ff8a3d]' : 'text-zinc-500'}`}>
            {enabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-medium text-rose-300">
          <WarningIcon className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
    </div>
  );
}
