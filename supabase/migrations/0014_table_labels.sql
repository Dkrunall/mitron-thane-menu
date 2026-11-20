-- Mitron Thane — QR table ordering
-- 0014_table_labels.sql: tables are identified by text labels grouped into
-- floor sections (Main Floor "M1", Dining "D1", Outside "OD1", ...) instead
-- of plain integers. QR codes encode /order?table=<label>.
--
-- Run this whole file once in the Supabase SQL editor.

-- ── 1. table_number: int -> uppercase text label ──────────────────────────
alter table public.tables
  alter column table_number type text using table_number::text;

alter table public.tables
  add constraint tables_table_number_format
  check (table_number ~ '^[A-Z0-9-]{1,16}$');

-- ── 2. section + display order ────────────────────────────────────────────
alter table public.tables add column if not exists section text not null default 'Main Floor';
alter table public.tables add column if not exists sort_order int not null default 0;

-- ── 3. retire the old numbered starter tables (1..20) ─────────────────────
-- Tables with order history can't be deleted (orders.table_id has no
-- ON DELETE), so those are deactivated instead; their old QR codes stop
-- accepting orders but past orders keep their table.
delete from public.tables t
where t.table_number ~ '^[0-9]+$'
  and not exists (select 1 from public.orders o where o.table_id = t.id);

update public.tables
set is_active = false, section = 'Retired'
where table_number ~ '^[0-9]+$';

-- ── 4. the venue's tables ─────────────────────────────────────────────────
insert into public.tables (table_number, section, sort_order, qr_code_url, is_active)
select label, section, sort_order, '/order?table=' || label, true
from (values
  -- Main Floor
  ('MVIP1', 'Main Floor', 1), ('MVIP2', 'Main Floor', 2),
  ('M1', 'Main Floor', 3),  ('M2', 'Main Floor', 4),  ('M3', 'Main Floor', 5),
  ('M4', 'Main Floor', 6),  ('M6', 'Main Floor', 7),  ('M7', 'Main Floor', 8),
  ('M8', 'Main Floor', 9),  ('M9', 'Main Floor', 10), ('M10', 'Main Floor', 11),
  ('M11', 'Main Floor', 12), ('M12', 'Main Floor', 13),
  ('S1', 'Main Floor', 14), ('S2', 'Main Floor', 15), ('S3', 'Main Floor', 16),
  ('S4', 'Main Floor', 17),
  -- Dining
  ('D1', 'Dining', 1), ('D2', 'Dining', 2), ('D3', 'Dining', 3),
  ('D4', 'Dining', 4), ('D5', 'Dining', 5), ('D6', 'Dining', 6),
  -- Outside
  ('OD1', 'Outside', 1), ('OD2', 'Outside', 2), ('OD3', 'Outside', 3), ('OD4', 'Outside', 4),
  ('VIP1', 'Outside', 5), ('VIP2', 'Outside', 6),
  ('OM1', 'Outside', 7),  ('OM2', 'Outside', 8),  ('OM3', 'Outside', 9),
  ('OM4', 'Outside', 10), ('OM5', 'Outside', 11), ('OM6', 'Outside', 12),
  ('OM7', 'Outside', 13), ('OM8', 'Outside', 14), ('OM9', 'Outside', 15),
  ('OM10', 'Outside', 16), ('OM11', 'Outside', 17), ('OM12', 'Outside', 18),
  ('OT1', 'Outside', 19), ('OT2', 'Outside', 20), ('OT3', 'Outside', 21)
) as v(label, section, sort_order)
on conflict (table_number) do update
  set section = excluded.section,
      sort_order = excluded.sort_order,
      qr_code_url = excluded.qr_code_url,
      is_active = true;
