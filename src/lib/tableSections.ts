/** Display order for the venue's floor sections; any other section sorts after these. */
export const TABLE_SECTION_ORDER = ['Main Floor', 'Dining', 'Outside'];

/** Groups tables by section in floor order, keeping each section's existing order. */
export function groupTablesBySection<T extends { section: string }>(
  tables: T[]
): { section: string; tables: T[] }[] {
  const bySection = new Map<string, T[]>();
  for (const t of tables) {
    if (!bySection.has(t.section)) bySection.set(t.section, []);
    bySection.get(t.section)!.push(t);
  }
  const rank = (s: string) => {
    const i = TABLE_SECTION_ORDER.indexOf(s);
    return i === -1 ? TABLE_SECTION_ORDER.length : i;
  };
  return [...bySection.keys()]
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    .map((section) => ({ section, tables: bySection.get(section)! }));
}
