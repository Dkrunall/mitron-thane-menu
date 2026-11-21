-- Mitron Thane — QR table ordering
-- 0017_staff_push_subscriptions.sql: Web Push for staff phones, so "new
-- order" / "call waiter" / "request bill" alerts arrive even when the
-- admin app (or the home-screen shortcut) is closed or the phone is
-- locked. The in-page alerts on Live Orders only fire while it is open.
--
-- Run this whole file once in Supabase -> SQL Editor.

create table if not exists public.staff_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  -- The signed-in staff account that turned alerts on for this device.
  user_id uuid not null references auth.users(id) on delete cascade,
  -- One row per device: re-enabling on the same phone (or a different
  -- staff member signing in on it) updates the row instead of adding one.
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.staff_push_subscriptions enable row level security;

-- Only signed-in staff can register / remove a device. Sending reads every
-- row with the server's service role key (lib/push/notify.ts), because the
-- trigger for a staff alert is a *customer* placing an order, and guests
-- must never be able to read these rows themselves.
drop policy if exists "admins manage staff push subscriptions" on public.staff_push_subscriptions;
create policy "admins manage staff push subscriptions"
  on public.staff_push_subscriptions for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin() and user_id = auth.uid());
