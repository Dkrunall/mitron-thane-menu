'use client';

import type { MenuSection } from '@/types/menu';

/**
 * Horizontal strip of subcategory pill chips — mirrors the approved
 * mockup's category selector (Menu.dc.html) more closely than a photo
 * rail, and degrades gracefully since subcategories rarely have their own
 * representative photo (menu_items/categories images are mostly unset;
 * a rail of identical placeholder icons was a worse look than text
 * chips). Tapping one switches the item list below it in place, no
 * navigation to a separate screen.
 */
export function SubcategoryRail({
  categories,
  activeCategoryId,
  onSelect,
}: {
  categories: MenuSection['categories'];
  activeCategoryId: string | null;
  onSelect: (categoryId: string) => void;
}) {
  return (
    <div className="no-scrollbar sticky top-[4.5rem] z-10 -mx-4 flex gap-2 overflow-x-auto bg-[#09090b]/85 px-4 py-2 backdrop-blur-xl">
      {categories.map((cat) => {
        const isActive = cat.id === activeCategoryId;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-[linear-gradient(120deg,#ff8a3d,#e6401a_60%,#e90197)] text-black shadow-[0_4px_16px_-3px_rgba(230,64,26,0.55)]'
                : 'border border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
