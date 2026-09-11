import { notFound, redirect } from 'next/navigation';
import { OrderFrame } from '@/components/order/OrderShell';
import { OrderMessage } from '@/components/order/OrderMessage';
import { ItemDetailView } from '@/components/order/ItemDetailView';
import { getMenuItemById } from '@/lib/data/menu';

export default async function ItemQueryPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; table?: string }>;
}) {
  const { id, table } = await searchParams;
  const tableNumber = Number(table);

  if (!table || !Number.isInteger(tableNumber) || tableNumber <= 0) {
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

  const result = await getMenuItemById(id);
  if (!result) {
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
