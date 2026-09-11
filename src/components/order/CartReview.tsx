'use client';

import { useState, useTransition } from 'react';
import { unstable_rethrow } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart/CartContext';
import { formatPrice } from '@/lib/format';
import { placeOrder } from '@/lib/actions/orders';
import { primeAudio, requestNotificationPermission } from '@/lib/alerts';
import { CartIcon, PencilIcon, UsersIcon, WarningIcon } from '@/components/icons';

function GuestNameEditor({
  guestName,
  onRename,
}: {
  guestName: string;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(guestName);

  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onRename(draft);
          setEditing(false);
        }}
        className="inline-flex items-center gap-1.5"
      >
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            onRename(draft);
            setEditing(false);
          }}
          maxLength={40}
          className="w-28 rounded-lg border border-[#ff6830]/50 bg-[#1c1d22] px-2 py-0.5 text-xs font-bold text-white outline-none focus:border-[#ff6830]"
        />
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(guestName);
        setEditing(true);
      }}
      className="inline-flex items-center gap-1 text-xs font-bold text-zinc-100 hover:text-[#ff8a3d] transition-colors cursor-pointer"
    >
      <span className="underline decoration-white/25 underline-offset-2">{guestName}</span>
      <PencilIcon className="h-3 w-3 text-zinc-400" />
    </button>
  );
}

export function CartReview({ tableNumber }: { tableNumber: number }) {
  const { lines, updateQuantity, removeLine, totalPrice, guestId, guestName, setGuestName } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const tableLabel = `T-${tableNumber < 10 ? `0${tableNumber}` : tableNumber}`;
  const taxes = Math.round(totalPrice * 0.05);
  const finalTotal = totalPrice + taxes;
  const guestCount = new Set(lines.map((l) => l.guestId)).size;

  function handlePlaceOrder() {
    setError(null);
    primeAudio();
    void requestNotificationPermission();
    startTransition(async () => {
      try {
        await placeOrder(tableNumber);
      } catch (err) {
        unstable_rethrow(err);
        setError(
          err instanceof Error && err.message
            ? err.message
            : 'Something went wrong placing your order. Please try again.'
        );
      }
    });
  }

  if (lines.length === 0) {
    return (
      <div className="space-y-6 px-4 pt-3 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href={`/order?table=${tableNumber}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#18181c] border border-white/10 text-zinc-300 hover:text-white active:scale-95 transition-all shadow-sm"
            aria-label="Back to menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <h1 className="display text-2xl sm:text-3xl text-zinc-100 tracking-wider font-normal">
            YOUR ORDER
          </h1>
          <span className="rounded-full bg-[#18181c] border border-white/10 px-3 py-1 text-xs font-bold text-zinc-300">
            {tableLabel}
          </span>
        </div>

        <div className="mx-auto my-12 flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-white/10 bg-[#121215] p-8 text-center shadow-xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-[#ff8a3d]">
            <CartIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="display text-2xl text-white">Your Cart is Empty</h2>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Explore our menu and add your favorite dishes to place a table order.
            </p>
          </div>
          <Link
            href={`/order?table=${tableNumber}`}
            className="mt-2 w-full rounded-2xl bg-[linear-gradient(90deg,#ff6830_0%,#ef3b50_55%,#db2777_100%)] py-3.5 px-6 text-xs sm:text-sm font-extrabold text-black shadow-lg hover:brightness-105 active:scale-95 transition-all text-center"
          >
            Explore Menu →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-3 pb-8 space-y-3.5">
      {/* Top Header matching reference image: < , YOUR ORDER , T-04 */}
      <div className="flex items-center justify-between pb-0.5">
        <Link
          href={`/order?table=${tableNumber}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#18181c] border border-white/10 text-zinc-300 hover:text-white active:scale-95 transition-all shadow-sm"
          aria-label="Back to menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        <h1 className="display text-2xl sm:text-3xl text-zinc-100 tracking-wider font-normal">
          YOUR ORDER
        </h1>

        <span className="rounded-full bg-[#18181c] border border-white/10 px-3.5 py-1 text-xs font-bold text-zinc-300">
          {tableLabel}
        </span>
      </div>

      {/* Shared table guest indicator & name editor */}
      <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#121215] px-3.5 py-2 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <UsersIcon className="h-4 w-4 text-[#ff6830]" />
          <span>Ordering as:</span>
          <GuestNameEditor guestName={guestName} onRename={setGuestName} />
        </div>
        {guestCount > 1 ? (
          <span className="text-[11px] font-bold text-[#ff6830] bg-[#ff6830]/10 px-2 py-0.5 rounded-full border border-[#ff6830]/20">
            {guestCount} guests ordering together
          </span>
        ) : null}
      </div>

      {/* Cart item cards matching reference image */}
      <div className="space-y-3">
        {lines.map((line) => (
          <div
            key={line.id}
            className="rounded-2xl border border-white/[0.07] bg-[#121215] p-4 space-y-2.5 shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <h3 className="font-bold text-white text-[15px] sm:text-base leading-snug">
                  {line.menuItemName}
                </h3>
                <p className="text-xs text-zinc-400 font-normal">
                  {line.variantLabel || 'Regular'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeLine(line.id)}
                className="text-zinc-500 hover:text-zinc-300 active:scale-90 p-1 text-sm font-bold cursor-pointer transition-colors"
                aria-label="Remove item"
              >
                ✕
              </button>
            </div>

            {/* Dish special note if present */}
            {line.notes ? (
              <p className="rounded-xl border border-white/[0.07] bg-black/40 px-3 py-1 text-xs italic text-zinc-300">
                &ldquo;{line.notes}&rdquo;
              </p>
            ) : null}

            {/* Stepper + Price row */}
            <div className="flex items-center justify-between pt-0.5">
              {/* Stepper with orange plus button */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => updateQuantity(line.id, line.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1f1f26] text-zinc-300 hover:bg-white/10 active:scale-90 text-base font-bold transition-all cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-bold text-white">
                  {line.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(line.id, line.quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6830] text-black active:scale-90 text-base font-bold shadow-[0_2px_10px_rgba(255,104,48,0.4)] transition-all cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Price highlighted in bold orange */}
              <span className="text-base sm:text-lg font-black text-[#f97316]">
                {formatPrice(line.unitPrice * line.quantity)}
              </span>
            </div>

            {/* Added by guest attribution */}
            {line.guestName ? (
              <div className="pt-1 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-400">
                <span>
                  Added by <strong className="text-zinc-200 font-medium">{line.guestName}</strong>
                </span>
                {line.guestId === guestId ? (
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    You
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Note: a whole-order "special requests" field was removed here — it
          had no backend to save to (placeOrder only persists per-line notes,
          see lib/actions/orders.ts) so anything typed into it was silently
          discarded. Per-dish notes are still captured on the item detail
          page and do reach the kitchen. */}

      {/* Bill summary card */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121215] p-4 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-zinc-400 font-medium">Subtotal ({lines.reduce((n, l) => n + l.quantity, 0)} items)</span>
          <span className="font-bold text-zinc-100">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-zinc-400 font-medium">Taxes &amp; charges</span>
          <span className="font-bold text-zinc-100">{formatPrice(taxes)}</span>
        </div>
        <div className="border-t border-white/[0.07] pt-2.5 flex items-center justify-between">
          <span className="text-base font-bold text-white">Total</span>
          <span className="text-lg font-black text-[#f97316]">{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {error ? (
        <p className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400 pt-1">
          <WarningIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {/* Primary Place Order CTA button matching reference design */}
      <div className="pt-1">
        <button
          type="button"
          disabled={isPending}
          onClick={handlePlaceOrder}
          className="w-full rounded-2xl bg-[linear-gradient(90deg,#ff6830_0%,#ef3b50_55%,#db2777_100%)] py-4 px-6 text-black font-extrabold flex items-center justify-between shadow-[0_12px_36px_rgba(239,59,80,0.45)] transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          <span className="text-base tracking-wide">
            {isPending ? 'Placing order…' : 'Place order'}
          </span>
          <span className="text-base font-black">
            {formatPrice(finalTotal)}
          </span>
        </button>
      </div>

      {/* Add more items link */}
      <div className="text-center pt-2 pb-12">
        <Link
          href={`/order?table=${tableNumber}`}
          className="text-xs font-bold text-zinc-400 hover:text-[#ff6830] transition-colors"
        >
          + Add more items from menu
        </Link>
      </div>
    </div>
  );
}

