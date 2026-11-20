import { normalizeTableLabel } from '@/lib/tableLabel';
import { getActiveTableByNumber } from '@/lib/data/tables';
import { getMenuSections } from '@/lib/data/menu';
import { filterSectionsForBeverageMenu, getActiveBeverageMenu } from '@/lib/data/beverageMenu';
import { createClient } from '@/lib/supabase/server';
import { OrderMessage } from '@/components/order/OrderMessage';
import { MenuBrowser } from '@/components/order/MenuBrowser';

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string }>;
}) {
  const { table } = await searchParams;
  const tableNumber = normalizeTableLabel(table);

  if (!tableNumber) {
    return (
      <OrderMessage
        title="Scan the QR code at your table"
        body="This link is missing a table number. Please scan the QR code on your table to start ordering."
      />
    );
  }

  // Run both queries in parallel instead of one after the other.
  const supabase = await createClient();
  const [activeTable, allSections, beverageMenu] = await Promise.all([
    getActiveTableByNumber(tableNumber),
    getMenuSections(),
    getActiveBeverageMenu(supabase),
  ]);
  const sections = filterSectionsForBeverageMenu(allSections, beverageMenu);
  if (!activeTable) {
    return (
      <OrderMessage
        title="Table not found"
        body={`Table ${tableNumber} isn't available right now. Please ask a staff member for help.`}
      />
    );
  }

  return <MenuBrowser tableNumber={tableNumber} sections={sections} />;
}
