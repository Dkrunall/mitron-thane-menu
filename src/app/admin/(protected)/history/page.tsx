import { createClient } from '@/lib/supabase/server';
import { fetchOrderHistory } from '@/lib/data/orderHistory';
import { requireManagerOrRedirect } from '@/lib/actions/requireManager';
import { OrderHistoryList } from '@/components/admin/OrderHistoryList';

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; table?: string }>;
}) {
  await requireManagerOrRedirect();
  const { date, table } = await searchParams;
  const tableNumber = table ? Number(table) : undefined;
  const filter = {
    date: date || undefined,
    tableNumber: tableNumber && Number.isInteger(tableNumber) && tableNumber > 0 ? tableNumber : undefined,
  };

  const supabase = await createClient();
  const orders = await fetchOrderHistory(supabase, filter);

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="display text-3xl sm:text-4xl tracking-tight text-white">Order History</h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
          Archived and past dining table orders with live syncing
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3.5 rounded-2xl border border-white/10 bg-[#121215] p-4 sm:p-5 shadow-xl">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Date</label>
          <input
            type="date"
            name="date"
            defaultValue={date ?? ''}
            className="rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-100 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-zinc-300">Table number</label>
          <input
            type="number"
            name="table"
            min={1}
            defaultValue={table ?? ''}
            placeholder="All tables"
            className="w-32 rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs sm:text-sm font-semibold text-zinc-100 placeholder-zinc-500 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all"
          />
        </div>
        <button
          type="submit"
          className="gold-gradient-btn rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          Apply Filter
        </button>
        {date || table ? (
          <a href="/admin/history" className="text-xs sm:text-sm font-semibold text-[#ff8a3d] hover:underline py-2 transition-colors">
            Clear filters
          </a>
        ) : null}
      </form>

      <OrderHistoryList initialOrders={orders} filter={filter} />
    </div>
  );
}
