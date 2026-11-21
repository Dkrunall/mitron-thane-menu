'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ActionError, toActionResult, type ActionResult } from '@/lib/actions/errors';
import { requireManager } from '@/lib/actions/requireManager';
import { normalizeTableLabel } from '@/lib/tableLabel';

const GENERIC_FAILURE_MESSAGE = 'Something went wrong. Please try again.';

// Same as menu.ts: orders.table_id has no ON DELETE clause (0001_schema.sql),
// so a table that's ever had an order placed at it can't be hard-deleted.
const FOREIGN_KEY_VIOLATION = '23503';

function isForeignKeyViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code?: unknown }).code === FOREIGN_KEY_VIOLATION;
}

function withSafeErrors(fn: () => Promise<unknown>): Promise<ActionResult> {
  return toActionResult(
    async () => {
      await requireManager();
      await fn();
    },
    GENERIC_FAILURE_MESSAGE,
    'tables action'
  );
}

const UNIQUE_VIOLATION = '23505';

/** Adds one table with a text label (e.g. "M13") to a floor section,
 *  placed after that section's existing tables. */
export async function createTable(rawLabel: string, rawSection: string): Promise<ActionResult> {
  return withSafeErrors(async () => {
    const label = normalizeTableLabel(rawLabel);
    if (!label) {
      throw new ActionError('Table label must be 1-16 letters, numbers or dashes (e.g. M13, OD5).');
    }
    const section = rawSection.trim();
    if (!section || section.length > 40) {
      throw new ActionError('Choose a section for the table.');
    }
    const supabase = await createClient();

    const { data: lastRow, error: lastError } = await supabase
      .from('tables')
      .select('sort_order')
      .eq('section', section)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (lastError) throw lastError;

    const { error } = await supabase.from('tables').insert({
      table_number: label,
      section,
      sort_order: (lastRow?.sort_order ?? 0) + 1,
      qr_code_url: `/order?table=${label}`,
      is_active: true,
    });
    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        throw new ActionError(`Table ${label} already exists.`);
      }
      throw error;
    }

    revalidatePath('/admin/tables');
  });
}

export async function setTableActive(id: string, isActive: boolean): Promise<ActionResult> {
  return withSafeErrors(async () => {
    const supabase = await createClient();
    const { error } = await supabase.from('tables').update({ is_active: isActive }).eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/tables');
  });
}

export async function deleteTable(id: string): Promise<ActionResult> {
  return withSafeErrors(async () => {
    const supabase = await createClient();
    const { error } = await supabase.from('tables').delete().eq('id', id);
    if (error) {
      if (isForeignKeyViolation(error)) {
        throw new ActionError('This table has order history, so it can\'t be deleted. Deactivate it instead to stop new orders/QR scans without losing past orders.');
      }
      throw error;
    }
    revalidatePath('/admin/tables');
  });
}
