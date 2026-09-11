'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/format';
import { ORDER_STATUS_LABEL } from '@/lib/orderStatus';
import type { OrderHistoryEntry } from '@/lib/data/orderHistory';

const STATUS_STYLE: Record<string, string> = {
  placed: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  preparing: 'border-[#ff6830]/50 bg-[#ff6830]/15 text-[#ff8a3d]',
  ready: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  served: 'border-white/10 bg-zinc-900 text-zinc-400',
};

export function OrderHistoryRow({ order, sittingLabel }: { order: OrderHistoryEntry; sittingLabel?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121215] shadow-lg transition-all duration-200 hover:border-white/20 hover:bg-[#141418]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-white text-base">
            Table {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}
          </span>
          {sittingLabel ? (
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
              {sittingLabel}
            </span>
          ) : null}
          <span className={`rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[order.status] ?? ''}`}>
            {ORDER_STATUS_LABEL[order.status]}
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm sm:text-base font-extrabold text-[#f97316]">{formatPrice(order.total)}</span>
          <span className="text-xs text-zinc-400 font-bold">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open ? (
        <div className="space-y-2 border-t border-white/5 bg-black/40 p-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-3 text-xs text-zinc-200">
              <div>
                <span className="font-extrabold text-[#ff8a3d]">{item.quantity}×</span>{' '}
                <span className="font-bold text-zinc-100">{item.menuItemName}</span>
                {item.variantLabel ? <span className="text-zinc-400 font-medium"> ({item.variantLabel})</span> : null}
                {item.notes ? <p className="text-[11px] text-[#f37540]/90 italic font-medium">&ldquo;{item.notes}&rdquo;</p> : null}
              </div>
              <span className="font-extrabold text-[#f97316]">{formatPrice(item.priceAtOrder * item.quantity)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

