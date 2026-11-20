import { createClient } from '@/lib/supabase/server';

export interface AdminTable {
  id: string;
  tableNumber: string;
  section: string;
  sortOrder: number;
  isActive: boolean;
}

export async function getAllTables(): Promise<AdminTable[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tables')
    .select('id, table_number, section, sort_order, is_active')
    .order('sort_order', { ascending: true })
    .order('table_number', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((t) => ({
    id: t.id,
    tableNumber: t.table_number,
    section: t.section,
    sortOrder: t.sort_order,
    isActive: t.is_active,
  }));
}
