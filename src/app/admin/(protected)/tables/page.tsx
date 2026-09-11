import { getAllTables } from '@/lib/data/adminTables';
import { requireManagerOrRedirect } from '@/lib/actions/requireManager';
import { TablesManager } from '@/components/admin/TablesManager';

export default async function AdminTablesPage() {
  await requireManagerOrRedirect();
  const tables = await getAllTables();

  return (
    <div className="space-y-6">
      <div className="border-b border-white/10 pb-5">
        <h1 className="display text-3xl sm:text-4xl tracking-tight text-white">Tables &amp; QR Codes</h1>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
          Manage physical dining tables and export print-ready QR codes for table ordering
        </p>
      </div>
      <TablesManager tables={tables} />
    </div>
  );
}
