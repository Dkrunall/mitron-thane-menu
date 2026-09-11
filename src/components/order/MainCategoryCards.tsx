'use client';

import Image from 'next/image';
import type { MenuSection } from '@/types/menu';
import {
  BottleIcon,
  CakeSliceIcon,
  CocktailIcon,
  CoffeeCupIcon,
  CupStrawIcon,
  ForkKnifeIcon,
  MocktailIcon,
  PlateIcon,
} from '@/components/icons';
import { isValidImageSrc } from '@/lib/imageUrl';
import type { ComponentType, SVGProps } from 'react';

const SECTION_ICON: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Food: ForkKnifeIcon,
  Bar: BottleIcon,
  'Signature Cocktails': CocktailIcon,
  'Signature Mocktails': MocktailIcon,
  Barista: CoffeeCupIcon,
  Beverages: CupStrawIcon,
  Desserts: CakeSliceIcon,
};

/** First available photo within a section, for the card background —
 *  prefers a category's own representative photo over an individual
 *  dish/drink's, since most items don't have one but many categories do. */
function representativeImage(section: MenuSection): string | null {
  for (const cat of section.categories) {
    if (isValidImageSrc(cat.imageUrl)) return cat.imageUrl;
  }
  for (const cat of section.categories) {
    for (const item of cat.items) {
      if (isValidImageSrc(item.imageUrl)) return item.imageUrl;
    }
  }
  return null;
}

function totalItemCount(section: MenuSection): number {
  return section.categories.reduce((n, cat) => n + cat.items.length, 0);
}

/**
 * Horizontal strip of full-bleed photo cards, one per main category —
 * mirrors a restaurant app's "browse by category" hero row: a real dish
 * photo fills the card, with the category name overlaid at the bottom.
 * Tapping one drills into that category's subcategories.
 */
export function MainCategoryCards({
  sections,
  onSelect,
}: {
  sections: MenuSection[];
  onSelect: (section: string) => void;
}) {
  return (
    <div className="flex gap-3 sm:gap-3.5 overflow-x-auto no-scrollbar pb-2 pl-4 pr-4 -mx-4 snap-x snap-mandatory">
      {sections.map((section) => {
        const image = representativeImage(section);
        const itemCount = totalItemCount(section);
        const SectionIcon = SECTION_ICON[section.section] ?? PlateIcon;
        return (
          <button
            key={section.section}
            type="button"
            onClick={() => onSelect(section.section)}
            className="group relative h-56 sm:h-60 w-36 sm:w-40 shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 bg-[#121215] shadow-xl transition-all duration-300 hover:border-transparent hover:shadow-[0_0_28px_-4px_rgba(230,64,26,0.55)] active:scale-[0.97] cursor-pointer"
          >
            {image ? (
              <Image
                src={image}
                alt={section.section}
                fill
                sizes="160px"
                className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <SectionIcon className="h-10 w-10 text-zinc-500" />
              </div>
            )}

            {/* Dark vignette + coral/pink glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#e6401a]/0 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:from-[#e6401a]/25" />

            {/* Label overlay */}
            <div className="relative z-10 flex h-full flex-col justify-end p-3 text-left">
              <h3 className="display truncate text-lg text-zinc-100 group-hover:text-[var(--mitron-flame)] transition-colors">
                {section.section}
              </h3>
              <p className="flex items-center gap-1 text-[11px] font-semibold text-zinc-400 group-hover:text-amber-400/90 transition-colors">
                <span>{itemCount} {itemCount === 1 ? 'dish' : 'dishes'}</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
