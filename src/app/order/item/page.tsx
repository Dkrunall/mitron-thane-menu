import { normalizeTableLabel } from '@/lib/tableLabel';
import { notFound, redirect } from 'next/navigation';
import { OrderFrame } from '@/components/order/OrderShell';
import { OrderMessage } from '@/components/order/OrderMessage';
import { ItemDetailView } from '@/components/order/ItemDetailView';
import { getMenuItemById } from '@/lib/data/menu';
import { getActiveBeverageMenu, isCategoryVisible } from '@/lib/data/beverageMenu';
import { createClient } from '@/lib/supabase/server';

export default async function ItemQueryPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; table?: string }>;
}) {
  const { id, table } = await searchParams;
  const tableNumber = normalizeTableLabel(table);

  if (!tableNumber) {
    return (
      <OrderMessage
        title="Scan the QR code at your table"
        body="This link is missing a table number. Please scan the QR code on your table to start ordering."
      />
    );
  }

  if (!id) {
    redirect(`/order?table=${tableNumber}`);
  }

  const supabase = await createClient();
  const [result, activeMenu] = await Promise.all([getMenuItemById(id), getActiveBeverageMenu(supabase)]);
  // Drinks from the beverage menu that's switched off aren't orderable.
  if (!result || !isCategoryVisible(result.beverageMenu, activeMenu)) {
    return notFound();
  }

  return (
    <OrderFrame tableNumber={tableNumber} showCartBar={true}>
      <ItemDetailView
        item={result.item}
        categoryName={result.categoryName}
        tableNumber={tableNumber}
      />
    </OrderFrame>
  );
}
