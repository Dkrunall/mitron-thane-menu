// Server-only. Sends Web Push notifications — these reach the customer's
// device even if the tab/browser is fully closed, unlike the in-tab
// Notification API alert (see lib/alerts.ts) which only fires while a tab
// is open. Never imported into client code (only from Server Actions,
// e.g. lib/actions/adminOrders.ts).
import webpush from 'web-push';
import { after } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, OrderStatus } from '@/types/database';
import { createServiceClient } from '@/lib/supabase/service';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@mitronthane.example';

// Web Push is optional. Missing *or invalid* keys (e.g. placeholder values
// left in the host's env) just disable it — setVapidDetails throws on a bad
// key, and since this runs when the module loads, an unguarded throw here
// would break every staff status-change action that imports this file.
function configurePush(): boolean {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    return true;
  } catch (err) {
    console.error('Web Push disabled — invalid VAPID settings:', err instanceof Error ? err.message : err);
    return false;
  }
}

const pushConfigured = configurePush();

// What the guest's phone shows for each order status change. 'placed'
// (they just did that) and 'served' (staff is at the table) send nothing.
const ORDER_STATUS_PUSH: Partial<Record<OrderStatus, (table: string) => { title: string; body: string }>> = {
  preparing: (table) => ({
    title: 'Your order is being prepared 🍳',
    body: `Table ${table} — the kitchen has started on your order.`,
  }),
  ready: (table) => ({
    title: 'Your order is ready! 🔔',
    body: `Table ${table} — head to your table, staff is on the way.`,
  }),
};

/**
 * Pushes an order status update to every device subscribed for this order
 * (guests don't need to install anything on Android — Chrome delivers it
 * with the tab in the background or the browser closed). A no-op if VAPID
 * keys aren't configured.
 */
async function sendOrderStatusPush(
  supabase: SupabaseClient<Database>,
  orderId: string,
  tableNumber: string,
  status: OrderStatus
) {
  const message = ORDER_STATUS_PUSH[status];
  if (!pushConfigured || !message) return;

  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('order_id', orderId);
  if (!subs || subs.length === 0) return;

  // One tag per order: "Ready" replaces "Preparing" in the tray instead of
  // stacking, and renotify makes the replacement buzz again. The in-tab
  // alert on the status page uses the same tag, so the two collapse.
  const payload = JSON.stringify({
    ...message(tableNumber),
    url: `/order/status?table=${tableNumber}&order=${orderId}`,
    tag: `order-status-${orderId}`,
    renotify: true,
  });

  await sendToSubscriptions(subs, payload, async (id) => {
    await supabase.from('push_subscriptions').delete().eq('id', id);
  });
}

interface StoredSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

async function sendToSubscriptions(
  subs: StoredSubscription[],
  payload: string,
  removeGone: (id: string) => Promise<void>
) {
  await Promise.all(
    subs.map(async (sub) => {
      try {
        // TTL: how long the push service keeps trying a phone that is
        // offline/asleep. Urgency 'high' asks Android to wake the device
        // right away instead of batching it into the next doze window.
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, {
          TTL: 60 * 60,
          urgency: 'high',
        });
      } catch (err) {
        const statusCode = (err as { statusCode?: number } | null)?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Push service says this subscription is gone (browser data
          // cleared, permission revoked, app uninstalled) — clean it up
          // rather than retrying it forever.
          await removeGone(sub.id);
        } else {
          console.error('Web Push send failed:', err);
        }
      }
    })
  );
}

export interface StaffAlert {
  title: string;
  body: string;
  /** Same tag the in-page alert on Live Orders uses, so the two collapse. */
  tag: string;
}

/**
 * Pushes an alert to every staff device that turned alerts on (Live
 * Orders → Enable Alerts), so it arrives with the app closed or the phone
 * locked. Runs after the response is sent (`after`), so a guest placing an
 * order never waits on it, and never throws.
 */
export function notifyStaff(alert: StaffAlert) {
  if (!pushConfigured) return;
  after(async () => {
    try {
      const supabase = createServiceClient();
      if (!supabase) return;
      const { data: subs, error } = await supabase.from('staff_push_subscriptions').select('id, endpoint, p256dh, auth');
      if (error) throw error;
      if (!subs || subs.length === 0) return;
      const payload = JSON.stringify({ ...alert, url: '/admin/dashboard', requireInteraction: true });
      await sendToSubscriptions(subs, payload, async (id) => {
        await supabase.from('staff_push_subscriptions').delete().eq('id', id);
      });
    } catch (err) {
      console.error('notifyStaff failed:', err);
    }
  });
}

/**
 * Wraps an order_items mutation that might change the parent order's
 * (derived) status, pushing the guest an update exactly once if it
 * actually changed. Compares before/after rather than trusting the
 * caller's own status math, since the order's status is computed by a DB
 * trigger (see 0011_order_item_status.sql), not set directly.
 */
export async function runAndNotifyOnStatusChange<T>(
  supabase: SupabaseClient<Database>,
  orderId: string,
  fn: () => Promise<T>
): Promise<T> {
  const { data: before } = await supabase
    .from('orders')
    .select('status, tables ( table_number )')
    .eq('id', orderId)
    .maybeSingle();

  const result = await fn();

  if (before) {
    const { data: after } = await supabase.from('orders').select('status').eq('id', orderId).maybeSingle();
    if (after && after.status !== before.status) {
      // The status change already succeeded; a push failure must not undo
      // that from the caller's point of view.
      try {
        await sendOrderStatusPush(supabase, orderId, before.tables.table_number, after.status);
      } catch (err) {
        console.error('sendOrderStatusPush failed:', err);
      }
    }
  }

  return result;
}
