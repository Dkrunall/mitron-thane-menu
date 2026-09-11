import { getMenuSections } from '@/lib/data/menu';
import { requireManagerOrRedirect } from '@/lib/actions/requireManager';
import { CategoryCard } from '@/components/admin/CategoryCard';
import { CategoryForm } from '@/components/admin/CategoryForm';

export default async function AdminMenuPage() {
  await requireManagerOrRedirect();
  const sections = await getMenuSections();
  const totalItems = sections.reduce(
    (n, s) => n + s.categories.reduce((m, c) => m + c.items.length, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="display text-3xl sm:text-4xl tracking-tight text-white">Menu Items</h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium">
            Manage dishes, cocktails, bar items, and category hierarchy
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="glass-pill rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-zinc-300">
            {sections.reduce((n, s) => n + s.categories.length, 0)} categories
          </span>
          <span className="glass-pill rounded-full border border-[#ff6830]/40 bg-[#ff6830]/10 px-3 py-1 text-xs font-bold text-[#ff8a3d]">
            {totalItems} items
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#121215] p-4 sm:p-5 shadow-xl">
        <h2 className="mb-3 text-xs font-bold tracking-wider text-[#ff8a3d] uppercase">Create New Category</h2>
        <CategoryForm />
      </div>

      {sections.map((section) => (
        <div key={section.section} className="space-y-3 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#ff8a3d] shadow-[0_0_6px_#ff8a3d]" />
            <h2 className="display text-xl tracking-tight text-white">{section.section}</h2>
            <span className="h-px flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {section.categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                categoryId={cat.id}
                name={cat.name}
                itemCount={cat.items.length}
                imageUrl={cat.imageUrl}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
