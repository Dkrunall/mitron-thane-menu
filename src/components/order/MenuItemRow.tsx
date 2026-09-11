'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/types/menu';
import { useCart } from '@/lib/cart/CartContext';
import { formatPrice } from '@/lib/format';
import { AlcoholicBadge, FssaiDietaryIcon } from './DietaryBadge';
import { CheckIcon } from '@/components/icons';

export function MenuItemRow({
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
  const [justAdded, setJustAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const hasVariants = item.variants.length > 0;
  const priceLabel = hasVariants
    ? `From ${formatPrice(Math.min(...item.variants.map((v) => v.price)))}`
    : item.isAvailable
    ? formatPrice(item.price)
    : 'Sold out';

  function handleCardClick() {
    if (!item.isAvailable) return;
    router.push(`/order/item/${item.id}?table=${tableNumber}`);
  }

  async function handleQuickAdd(e: React.MouseEvent) {
    e.stopPropagation();
    if (isAdding || !item.isAvailable) return;
    setIsAdding(true);

    const variant = hasVariants ? item.variants[0] : null;
    const ok = await addLine({
      menuItemId: item.id,
      menuItemName: item.name,
      categoryName,
      variantId: variant?.id ?? null,
      variantLabel: variant?.label ?? null,
      unitPrice: variant ? variant.price : item.price,
      quantity: 1,
      notes: '',
      imageUrl: item.imageUrl,
    });

    setIsAdding(false);
    if (ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121215] hover:border-white/15 hover:bg-[#15151a] p-3.5 sm:p-4 transition-all duration-200 cursor-pointer select-none shadow-sm ${
        !item.isAvailable ? 'opacity-40 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3.5 text-left">
        {/* Left item details */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title row: clicking title directly adds to cart */}
          <div
            className="inline-flex items-center gap-2 group cursor-pointer"
            onClick={handleQuickAdd}
            title="Tap to add to cart"
          >
            {item.dietaryType ? <FssaiDietaryIcon type={item.dietaryType} /> : null}
            {item.isAlcoholic ? <AlcoholicBadge /> : null}
            <p className="font-bold text-zinc-100 text-[15px] sm:text-base leading-snug tracking-tight group-hover:text-[#ff8a3d] transition-colors">
              {item.name}
            </p>
            {justAdded ? (
              <span className="text-[11px] font-bold text-emerald-400 animate-fadeIn">
                Added ✓
              </span>
            ) : null}
          </div>

          {/* Description */}
          {item.description ? (
            <p className="line-clamp-2 text-xs sm:text-[13px] text-zinc-400 leading-relaxed font-normal">
              {item.description}
            </p>
          ) : null}

          {/* Price */}
          <p className="text-sm sm:text-base font-extrabold text-[#f97316] pt-0.5 tracking-tight">
            {priceLabel}
          </p>
        </div>

        {/* Right side: circular + add button */}
        {item.isAvailable ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isAdding}
            className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full text-black font-black text-xl transition-all shadow-[0_4px_16px_rgba(249,115,22,0.45)] active:scale-90 cursor-pointer ${
              justAdded
                ? 'bg-emerald-500 text-black shadow-emerald-500/30 scale-105'
                : 'bg-[linear-gradient(135deg,#ff6830,#e6401a)] hover:brightness-110'
            }`}
            aria-label="Add to cart"
            title="Add to cart"
          >
            {justAdded ? <CheckIcon className="h-5 w-5" /> : '+'}
          </button>
        ) : null}
      </div>
    </div>
  );
}

