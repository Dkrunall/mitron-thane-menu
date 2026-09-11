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

const DEFAULT_SECTION_IMAGES: Record<string, string> = {
  Food: '/categories/food.jpg',
  Bar: '/categories/bar.jpg',
  'Signature Cocktails': '/categories/bar.jpg',
  'Signature Mocktails': '/categories/beverages.jpg',
  Barista: '/categories/beverages.jpg',
  Beverages: '/categories/beverages.jpg',
  Desserts: '/categories/food.jpg',
  Brunch: '/categories/brunch.jpg',
};

/** First available photo within a section, for the card background —
 *  prefers a category's own representative photo over an individual
 *  dish/drink's, and falls back to our curated high-res category imagery. */
function representativeImage(section: MenuSection): string | null {
  for (const cat of section.categories) {
    if (isValidImageSrc(cat.imageUrl)) return cat.imageUrl;
  }
  for (const cat of section.categories) {
    for (const item of cat.items) {
      if (isValidImageSrc(item.imageUrl)) return item.imageUrl;
    }
  }
  return DEFAULT_SECTION_IMAGES[section.section] ?? '/categories/food.jpg';
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
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {sections.map((section) => {
        const image = representativeImage(section);
        const itemCount = totalItemCount(section);
        const SectionIcon = SECTION_ICON[section.section] ?? PlateIcon;
        return (
          <button
            key={section.section}
            type="button"
            onClick={() => onSelect(section.section)}
            className="group relative h-48 sm:h-52 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#121216] p-4 text-left shadow-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-[0_8px_28px_rgba(230,64,26,0.35)] active:scale-[0.98] cursor-pointer flex flex-col justify-between"
          >
            {image ? (
              <Image
                src={image}
                alt={section.section}
                fill
                sizes="240px"
                className="object-cover opacity-75 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-90"
              />
            ) : null}

            {/* Dark vignette + subtle glow overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#e6401a]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Top icon badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition-colors shadow-sm">
                <SectionIcon className="h-5 w-5" />
              </span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-zinc-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all text-xs font-bold">
                →
              </span>
            </div>

            {/* Bottom info */}
            <div className="relative z-10 space-y-0.5">
              <h3 className="display text-xl sm:text-2xl text-white tracking-wide group-hover:text-amber-400 transition-colors">
                {section.section}
              </h3>
              <p className="text-xs font-semibold text-zinc-400">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
