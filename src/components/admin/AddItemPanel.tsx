'use client';

import { useState } from 'react';
import { MenuItemForm } from './MenuItemForm';

export function AddItemPanel({ categoryId, nextSortOrder }: { categoryId: string; nextSortOrder: number }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-white/20 bg-[#121215]/50 hover:border-[#ff6830]/50 hover:bg-[#18181c] py-3.5 text-xs sm:text-sm font-bold text-[#ff8a3d] transition-all cursor-pointer shadow-sm active:scale-[0.99]"
      >
        + Add item to this category
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121215] p-4 sm:p-5 shadow-xl">
      <MenuItemForm
        categoryId={categoryId}
        initial={{ sortOrder: nextSortOrder, isAvailable: true }}
        onDone={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
