'use client';

import { useState, useTransition } from 'react';
import { createMenuItem, updateMenuItem, type MenuItemInput, type MenuItemVariantInput } from '@/lib/actions/menu';
import type { DietaryType } from '@/types/database';
import { CloseIcon } from '@/components/icons';

const DIETARY_OPTIONS: { value: DietaryType | ''; label: string }[] = [
  { value: '', label: 'None' },
  { value: 'veg', label: 'Veg' },
  { value: 'non_veg', label: 'Non-Veg' },
  { value: 'egg', label: 'Contains Egg' },
  { value: 'seafood', label: 'Seafood' },
];

export function MenuItemForm({
  categoryId,
  itemId,
  initial,
  onDone,
  onCancel,
}: {
  categoryId: string;
  itemId?: string;
  initial?: Partial<MenuItemInput>;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [dietaryType, setDietaryType] = useState<DietaryType | ''>(initial?.dietaryType ?? '');
  const [isAlcoholic, setIsAlcoholic] = useState(initial?.isAlcoholic ?? false);
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [variants, setVariants] = useState<MenuItemVariantInput[]>(initial?.variants ?? []);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function addVariant() {
    setVariants((v) => [...v, { label: '', price: 0 }]);
  }
  function updateVariant(i: number, patch: Partial<MenuItemVariantInput>) {
    setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function removeVariant(i: number) {
    setVariants((v) => v.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input: MenuItemInput = {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      dietaryType: dietaryType || null,
      isAlcoholic,
      isAvailable,
      sortOrder,
      variants,
    };
    startTransition(async () => {
      try {
        if (itemId) await updateMenuItem(itemId, input);
        else await createMenuItem(input);
        onDone?.();
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : 'Failed to save item.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Image URL</label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Brief description of flavors, ingredients..."
          className="w-full resize-none rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Price (₹)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Dietary</label>
          <select
            value={dietaryType}
            onChange={(e) => setDietaryType(e.target.value as DietaryType | '')}
            className="w-full rounded-xl border border-white/10 bg-[#121215] px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all cursor-pointer"
          >
            {DIETARY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#121215] text-zinc-100">
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Sort order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
          />
        </div>
        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isAlcoholic}
              onChange={(e) => setIsAlcoholic(e.target.checked)}
              className="accent-[#ff8a3d] h-4 w-4 rounded cursor-pointer"
            />
            Alcoholic
          </label>
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="accent-[#ff8a3d] h-4 w-4 rounded cursor-pointer"
            />
            Available
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-black/30 p-3">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-xs font-bold text-zinc-300">
            Serving-size variants (optional — e.g. Peg / Bottle)
          </label>
          <button type="button" onClick={addVariant} className="text-xs font-bold text-[#ff8a3d] hover:underline cursor-pointer">
            + Add variant
          </button>
        </div>
        {variants.length > 0 ? (
          <div className="space-y-2">
            {variants.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  placeholder="Label, e.g. Peg"
                  value={v.label}
                  onChange={(e) => updateVariant(i, { label: e.target.value })}
                  className="flex-1 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#ff8a3d]"
                />
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                  className="w-28 rounded-xl border border-white/10 bg-black/60 px-3 py-1.5 text-xs sm:text-sm text-zinc-100 outline-none focus:border-[#ff8a3d]"
                />
                <button type="button" onClick={() => removeVariant(i)} className="text-zinc-400 hover:text-rose-400 cursor-pointer p-1">
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-medium text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="gold-gradient-btn rounded-xl px-4 py-2 text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
        >
          {isPending ? 'Saving…' : itemId ? 'Save Changes' : '+ Add Item'}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
