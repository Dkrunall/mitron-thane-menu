import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryById } from '@/lib/data/menu';
import { requireManagerOrRedirect } from '@/lib/actions/requireManager';
import { MenuItemAdminRow } from '@/components/admin/MenuItemAdminRow';
import { AddItemPanel } from '@/components/admin/AddItemPanel';
import { EditCategoryPanel } from '@/components/admin/EditCategoryPanel';

export default async function AdminCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  await requireManagerOrRedirect();
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);
  if (!category) notFound();

  const nextSortOrder = category.items.length > 0 ? Math.max(...category.items.map((i) => i.sortOrder)) + 1 : 0;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/menu"
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/10 px-4 py-2 text-xs font-bold text-zinc-200 hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
      >
        <span className="text-[#ff8a3d]">←</span>
        <span>Back to All Categories</span>
      </Link>

      <EditCategoryPanel
        categoryId={category.id}
        initial={{
          name: category.name,
          section: category.section,
          sortOrder: category.sortOrder,
          imageUrl: category.imageUrl ?? '',
        }}
      />

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff8a3d] shadow-[0_0_6px_#ff8a3d]" />
            <h2 className="display text-xl tracking-tight text-white">Items in this Category</h2>
          </div>
          <span className="glass-pill rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-zinc-300">
            {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {category.items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#121215] p-8 text-center shadow-lg">
            <p className="text-sm font-medium text-zinc-400">No items in this category yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {category.items.map((item) => <MenuItemAdminRow key={item.id} item={item} categoryId={category.id} />)}
          </div>
        )}
      </div>

      <AddItemPanel categoryId={category.id} nextSortOrder={nextSortOrder} />
    </div>
  );
}
