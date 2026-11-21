'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ActionError, toActionResult, type ActionResult } from '@/lib/actions/errors';
import { getActiveBeverageMenu, isCategoryVisible } from '@/lib/data/beverageMenu';
import type { BeverageMenu } from '@/types/database';

const GENERIC_FAILURE_MESSAGE = 'Something went wrong placing your order. Please try again.';

/**
 * Places an order for a table from whatever is *currently* in the table's
 * shared cart_items — read fresh from the DB here, not from the client's
 * local cart state. Prices are always re-derived from menu_items/
 * menu_item_variants too, never trusted from the client. Both close the
 * same class of hole: a customer editing browser state, or (more likely
 * in practice) a race where another guest at the table adds a line after
 * this browser's last cart sync but before the tap on "Send Order to
 * Kitchen" — trusting the client's snapshot would either drop that guest's
 * item entirely or resurrect it after the blanket cart-clear used to wipe
 * it. Reading + deleting by exact row id here means a concurrent add
 * simply survives, untouched, for the next order instead.
 *
 * Failures are returned, not thrown (see ActionResult); anything unexpected
 * (a raw Postgres/PostgREST error, say) becomes a generic message rather
 * than leaking internals.
 */
export async function placeOrder(tableNumber: string): Promise<ActionResult> {
  return toActionResult(() => placeOrderUnsafe(tableNumber), GENERIC_FAILURE_MESSAGE, 'placeOrder');
}

async function placeOrderUnsafe(tableNumber: string) {
  const supabase = await createClient();

  const { data: table, error: tableError } = await supabase
    .from('tables')
    .select('id')
    .eq('table_number', tableNumber)
    .eq('is_active', true)
    .maybeSingle();
  if (tableError) throw tableError;
  if (!table) throw new ActionError('This table is not available. Please ask a staff member.');

  const { data: cartRows, error: cartError } = await supabase
    .from('cart_items')
    .select('id, menu_item_id, variant_id, quantity, notes')
    .eq('table_id', table.id);
  if (cartError) throw cartError;
  if (!cartRows || cartRows.length === 0) throw new ActionError('Your cart is empty.');

  const menuItemIds = [...new Set(cartRows.map((l) => l.menu_item_id))];
  const variantIds = [...new Set(cartRows.map((l) => l.variant_id).filter((id): id is string => !!id))];

  const [{ data: menuItems, error: itemsError }, activeMenu] = await Promise.all([
    supabase.from('menu_items').select('id, price, is_available, categories ( beverage_menu )').in('id', menuItemIds),
    getActiveBeverageMenu(supabase),
  ]);
  if (itemsError) throw itemsError;

  const { data: variants, error: variantsError } = variantIds.length
    ? await supabase.from('menu_item_variants').select('id, menu_item_id, price').in('id', variantIds)
    : { data: [], error: null };
  if (variantsError) throw variantsError;

  const itemById = new Map((menuItems ?? []).map((i) => [i.id, i]));
  const variantById = new Map((variants ?? []).map((v) => [v.id, v]));

  const orderItemsToInsert: {
    menu_item_id: string;
    variant_id: string | null;
    quantity: number;
    notes: string | null;
    price_at_order: number;
  }[] = [];

  for (const line of cartRows) {
    const item = itemById.get(line.menu_item_id);
    if (!item || !item.is_available) {
      throw new ActionError('One of the items in your cart is no longer available. Please review your cart.');
    }
    // The drinks menu may have been switched (All Day <-> Party) after this
    // line was added; its old price must not be charged.
    const categoryMenu = (item.categories as unknown as { beverage_menu: BeverageMenu | null } | null)?.beverage_menu ?? null;
    if (!isCategoryVisible(categoryMenu, activeMenu)) {
      throw new ActionError('The drinks menu has changed since you added some drinks. Please remove them from your cart and add them again from the current menu.');
    }
    let price = Number(item.price);
    if (line.variant_id) {
      const variant = variantById.get(line.variant_id);
      if (!variant || variant.menu_item_id !== line.menu_item_id) {
        throw new ActionError('One of the items in your cart is no longer available. Please review your cart.');
      }
      price = Number(variant.price);
    }
    if (!Number.isInteger(line.quantity) || line.quantity <= 0 || line.quantity > 50) {
      throw new ActionError('Invalid quantity in cart.');
    }
    orderItemsToInsert.push({
      menu_item_id: line.menu_item_id,
      variant_id: line.variant_id,
      quantity: line.quantity,
      notes: line.notes?.trim() || null,
      price_at_order: price,
    });
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ table_id: table.id })
    .select('id')
    .single();
  if (orderError) throw orderError;

  const { error: insertItemsError } = await supabase
    .from('order_items')
    .insert(orderItemsToInsert.map((i) => ({ ...i, order_id: order.id })));
  if (insertItemsError) throw insertItemsError;

  // Clear exactly the cart rows this order was built from — not a blanket
  // "everything at this table_id" delete, so anything a concurrent guest
  // added after the SELECT above survives for their next order instead of
  // being silently wiped. Every phone still on the menu/cart screens for
  // this table sees the removal live via their cart_items realtime
  // subscription (see CartContext).
  await supabase.from('cart_items').delete().in('id', cartRows.map((r) => r.id));

  redirect(`/order/status?table=${tableNumber}&order=${order.id}`);
}
