'use client';

import { useState, useTransition } from 'react';
import { createCategory, updateCategory, type CategoryInput } from '@/lib/actions/menu';

export function CategoryForm({
  initial,
  categoryId,
  onDone,
}: {
  initial?: CategoryInput;
  categoryId?: string;
  onDone?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [section, setSection] = useState(initial?.section ?? '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const input: CategoryInput = { name, section, sortOrder, imageUrl };
    startTransition(async () => {
      try {
        if (categoryId) await updateCategory(categoryId, input);
        else await createCategory(input);
        if (!categoryId) {
          setName('');
          setSection('');
          setSortOrder(0);
          setImageUrl('');
        }
        onDone?.();
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : 'Failed to save category.');
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Category name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Small Plates"
          className="rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Section</label>
        <input
          required
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="Food, Bar, Barista"
          className="rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Sort order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-24 rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
        />
      </div>
      <div className="min-w-[240px] flex-1">
        <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Image URL (card cover)</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="gold-gradient-btn rounded-xl px-4 py-2.5 text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
      >
        {isPending ? 'Saving…' : categoryId ? 'Save Category' : '+ Add Category'}
      </button>
      {error ? (
        <div className="w-full rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-medium text-rose-300">
          {error}
        </div>
      ) : null}
    </form>
  );
}
