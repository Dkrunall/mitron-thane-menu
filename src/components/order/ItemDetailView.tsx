'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types/menu';
import { useCart } from '@/lib/cart/CartContext';
import { formatPrice } from '@/lib/format';
import { AlcoholicBadge, FssaiDietaryIcon } from './DietaryBadge';
import { isValidImageSrc } from '@/lib/imageUrl';
import { CheckIcon, WarningIcon } from '@/components/icons';

export function ItemDetailView({
  item,
  categoryName,
  tableNumber,
}: {
  item: MenuItem;
  categoryName: string;
  tableNumber: number;
}) {
  const router = useRouter();
  const { addLine } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    item.variants.length > 0 ? item.variants[0].id : null
  );
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVariant = item.variants.find((v) => v.id === selectedVariantId) ?? null;
  const currentPrice = selectedVariant ? selectedVariant.price : item.price;
  const totalPrice = currentPrice * quantity;

  async function handleAddToCart() {
    if (isAdding || !item.isAvailable) return;
    setIsAdding(true);
    setError(null);

    const ok = await addLine({
      menuItemId: item.id,
      menuItemName: item.name,
      categoryName,
      variantId: selectedVariant?.id ?? null,
      variantLabel: selectedVariant?.label ?? null,
      unitPrice: currentPrice,
      quantity,
      notes,
      imageUrl: item.imageUrl,
    });

    setIsAdding(false);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => {
        // Back to wherever the customer came from (a subcategory's item
        // list, or a search result) rather than always resetting to the
        // top-level category grid, which discarded their place in the menu.
        router.back();
      }, 700);
    } else {
      setError('Could not connect to cart. Please check connection and try again.');
    }
  }

  return (
    <div className="flex flex-col min-h-screen px-4 pt-3 pb-8 space-y-5">
      {/* Top Header: Back button. (A "favorite" heart toggle used to sit
          here — removed: it was local-only UI state with no backend table
          to save to, so it silently reset on every visit.) */}
      <div className="flex items-center">
        <Link
          href={`/order?table=${tableNumber}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#18181c] border border-white/10 text-zinc-300 hover:text-white active:scale-95 transition-all shadow-sm"
          aria-label="Back to menu"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </div>

      {/* Hero Circular Graphic matching the reference design */}
      <div className="relative flex items-center justify-center py-4 select-none">
        {/* Outer Orbit Rings */}
        <div className="relative flex items-center justify-center h-52 w-52 rounded-full border border-white/[0.06] bg-transparent">
          <div className="flex items-center justify-center h-40 w-40 rounded-full border border-white/[0.09] bg-transparent">
            {/* Center Dish / Glowing Orb */}
            {isValidImageSrc(item.imageUrl) ? (
              <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="relative flex items-center justify-center h-28 w-28 rounded-full bg-[linear-gradient(135deg,#ff5722_0%,#e91e63_100%)] shadow-[0_10px_36px_rgba(255,87,34,0.45)]">
                <span className="h-2 w-2 rounded-full bg-white/40 absolute -top-3" />
                <span className="h-3 w-1.5 rounded-full bg-white/30 absolute -top-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Title + Dietary Badge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="display text-2xl sm:text-3xl text-white font-normal uppercase tracking-wide leading-tight">
            {item.name}
          </h1>
          <div className="flex items-center gap-1.5 shrink-0">
            {item.dietaryType ? <FssaiDietaryIcon type={item.dietaryType} /> : null}
            {item.isAlcoholic ? <AlcoholicBadge /> : null}
          </div>
        </div>

        {/* Description */}
        {item.description ? (
          <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
            {item.description}
          </p>
        ) : null}
      </div>

      {/* SERVING SIZE (Variants) matching reference design */}
      {item.variants.length > 0 ? (
        <div className="space-y-2.5 pt-1">
          <p className="text-[11px] font-bold tracking-widest text-[#857d74] uppercase">
            Serving Size
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {item.variants.map((variant) => {
              const isSelected = selectedVariantId === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`rounded-2xl p-3.5 flex flex-col items-start gap-1 transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[linear-gradient(135deg,#ff5722_0%,#e91e63_100%)] text-black shadow-[0_4px_18px_rgba(255,87,34,0.35)] ring-1 ring-white/20'
                      : 'bg-[#141418] border border-white/[0.08] text-white hover:border-white/20 hover:bg-[#181820]'
                  }`}
                >
                  <span className={`text-sm font-extrabold ${isSelected ? 'text-black' : 'text-zinc-100'}`}>
                    {variant.label}
                  </span>
                  <span className={`text-xs font-black ${isSelected ? 'text-black/80' : 'text-zinc-400'}`}>
                    {formatPrice(variant.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* QUANTITY Stepper matching reference design */}
      <div className="space-y-2.5 pt-1">
        <p className="text-[11px] font-bold tracking-widest text-[#857d74] uppercase">
          Quantity
        </p>
        <div className="rounded-2xl border border-white/[0.08] bg-[#121215] p-2 inline-flex items-center gap-3.5 shadow-inner">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1c1d22] text-zinc-300 hover:bg-white/10 active:scale-90 text-base font-bold transition-all cursor-pointer"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-6 text-center text-sm sm:text-base font-bold text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6830] text-black active:scale-90 text-base font-bold shadow-[0_2px_10px_rgba(255,104,48,0.4)] transition-all cursor-pointer"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Special Instructions (Optional) */}
      <div className="space-y-1.5 pt-1">
        <p className="text-[11px] font-bold tracking-widest text-[#857d74] uppercase">
          Special Instructions
        </p>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='E.g. "Less spicy", "No onion"...'
          className="w-full rounded-2xl border border-white/[0.08] bg-[#121215] px-4 py-3 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#ff6830]/50 shadow-inner"
        />
      </div>

      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
          <WarningIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {/* Primary Bottom Action Button matching reference design */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isAdding || !item.isAvailable}
          onClick={handleAddToCart}
          className="w-full rounded-2xl bg-[linear-gradient(90deg,#ff6830_0%,#ef3b50_55%,#db2777_100%)] py-4 px-6 text-black font-extrabold flex items-center justify-between shadow-[0_12px_36px_rgba(239,59,80,0.45)] transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          <span className="text-base tracking-wide flex items-center gap-2">
            {justAdded ? (
              <>
                <CheckIcon className="h-5 w-5" />
                <span>Added to cart!</span>
              </>
            ) : isAdding ? (
              <span>Adding to cart…</span>
            ) : (
              <span>Add {quantity} to cart</span>
            )}
          </span>
          <span className="text-base font-black">
            {formatPrice(totalPrice)}
          </span>
        </button>
      </div>
    </div>
  );
}
