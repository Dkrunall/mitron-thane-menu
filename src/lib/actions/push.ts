'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentAdmin } from '@/lib/data/admin';

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Registers this device to receive a Web Push "your order is ready"
 * notification for the given order — see lib/push/notify.ts for the send
 * side. Upserts on (order_id, endpoint) so reopening the status page on
 * the same device doesn't create duplicate rows.
 *
 * Deliberately silent on failure: push is a pure enhancement layered on
 * top of the in-tab Notification API alert (lib/alerts.ts), which still
 * works either way — a customer shouldn't see a scary error just because
 * this optional background step didn't go through.
 */
export async function subscribeToOrderPush(orderId: string, subscription: PushSubscriptionInput) {
  const supabase = await createClient();

  // A plain insert, not an upsert: any INSERT ... ON CONFLICT also needs a
  // SELECT policy, and guests deliberately have none on this table
  // (0013_push_subscriptions.sql) — so the upsert was rejected by RLS for
  // every customer and no "order ready" push could ever be sent.
  const { error } = await supabase.from('push_subscriptions').insert({
    order_id: orderId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  });

  // 23505 = this phone is already subscribed for this order (page reopened).
  if (error && error.code !== '23505') console.error('subscribeToOrderPush failed:', error);
}

/**
 * Registers this staff device for background "new order" / waiter alerts
 * (see notifyStaff in lib/push/notify.ts). Upserts on endpoint so turning
 * alerts on again — or another staff member signing in on the same phone —
 * updates the one row for this device. Returns false when it didn't save,
 * so Live Orders can say background alerts aren't active.
 */
export async function subscribeStaffPush(subscription: PushSubscriptionInput): Promise<boolean> {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return false;
    const supabase = await createClient();
    const { error } = await supabase.from('staff_push_subscriptions').upsert(
      {
        user_id: admin.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { onConflict: 'endpoint' }
    );
    if (error) {
      console.error('subscribeStaffPush failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('subscribeStaffPush failed:', err);
    return false;
  }
}

/** Stops background staff alerts on this device (called on sign-out). */
export async function unsubscribeStaffPush(endpoint: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('staff_push_subscriptions').delete().eq('endpoint', endpoint);
    if (error) console.error('unsubscribeStaffPush failed:', error);
  } catch (err) {
    console.error('unsubscribeStaffPush failed:', err);
  }
}
