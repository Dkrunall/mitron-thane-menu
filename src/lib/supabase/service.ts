// Server-only Supabase client using the service role key — bypasses RLS.
// Used for exactly one thing: reading staff push subscriptions to send a
// "new order" alert, which is triggered by a guest (anon) request that
// must not be able to read those rows itself. Never import from client code.
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

let warned = false;

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    if (!warned) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is not set — staff background push alerts are disabled.');
      warned = true;
    }
    return null;
  }
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
