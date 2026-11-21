'use client';

import { throwIfActionError } from '@/lib/actions/errors';
import { useState, useTransition } from 'react';
import { createTable } from '@/lib/actions/tables';
import { downloadTableQrPdf } from '@/lib/qr/generatePdf';
import { TableQRCard } from './TableQRCard';
import type { AdminTable } from '@/lib/data/adminTables';
import { groupTablesBySection, TABLE_SECTION_ORDER } from '@/lib/tableSections';
import { DocumentIcon, TableIcon, WarningIcon } from '@/components/icons';

const inputClass =
  'rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-sm font-bold text-zinc-100 outline-none focus:border-[#ff8a3d] focus:ring-1 focus:ring-[#ff8a3d]/40 transition-all';

export function TablesManager({ tables }: { tables: AdminTable[] }) {
  const sections = groupTablesBySection(tables);
  const sectionNames = [
    ...TABLE_SECTION_ORDER,
    ...sections.map((s) => s.section).filter((s) => !TABLE_SECTION_ORDER.includes(s) && s !== 'Retired'),
  ];

  const [label, setLabel] = useState('');
  const [section, setSection] = useState(sectionNames[0]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        throwIfActionError(await createTable(label, section));
        setLabel('');
      } catch (err) {
        setError(err instanceof Error && err.message ? err.message : 'Failed to add table.');
      }
    });
  }

  async function handleExportPdf() {
    setIsExportingPdf(true);
    try {
      await downloadTableQrPdf(
        sections.flatMap((s) =>
          s.tables.filter((t) => t.isActive).map((t) => ({ tableNumber: t.tableNumber, section: s.section }))
        )
      );
    } finally {
      setIsExportingPdf(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#121215] p-4 sm:p-5 shadow-xl">
        <form onSubmit={handleCreate} className="flex items-end gap-3 flex-wrap">
          <div>
            <label htmlFor="new-table-label" className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Table label
            </label>
            <input
              id="new-table-label"
              type="text"
              required
              maxLength={16}
              autoCapitalize="characters"
              placeholder="e.g. M13"
              value={label}
              onChange={(e) => setLabel(e.target.value.toUpperCase())}
              className={`w-28 placeholder-zinc-500 ${inputClass}`}
            />
          </div>
          <div>
            <label htmlFor="new-table-section" className="mb-1.5 block text-xs font-semibold text-zinc-300">
              Section
            </label>
            <select
              id="new-table-section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className={inputClass}
            >
              {sectionNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending || !label.trim()}
            className="gold-gradient-btn rounded-xl px-4 py-2.5 text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all cursor-pointer"
          >
            {isPending ? 'Adding...' : '+ Add Table'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExportingPdf || tables.every((t) => !t.isActive)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:text-white active:scale-[0.98] disabled:opacity-60 transition-all shadow-sm cursor-pointer"
        >
          {isExportingPdf ? null : <DocumentIcon className="h-4 w-4 text-[#ff8a3d]" />}
          {isExportingPdf ? 'Generating PDF Document...' : 'Download Print PDF (Active QRs)'}
        </button>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs font-medium text-rose-300">
          <WarningIcon className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {tables.length === 0 ? (
        <div className="mx-auto my-12 flex max-w-md flex-col items-center gap-3 rounded-3xl p-10 text-center border border-white/10 bg-[#121215] shadow-2xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-zinc-500 shadow-inner">
            <TableIcon className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-zinc-100">No Tables Configured</h2>
          <p className="text-xs text-zinc-400">Add tables above to create table QR codes.</p>
        </div>
      ) : (
        sections.map(({ section: name, tables: sectionTables }) => (
          <section key={name} className="space-y-3">
            <div className="flex items-baseline gap-2">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#ff8a3d]">{name}</h2>
              <span className="text-xs font-semibold text-zinc-500">
                {sectionTables.length} table{sectionTables.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {sectionTables.map((table) => (
                <TableQRCard key={table.id} table={table} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
