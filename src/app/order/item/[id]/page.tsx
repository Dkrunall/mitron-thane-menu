import { notFound } from 'next/navigation';
import { OrderFrame } from '@/components/order/OrderShell';
import { OrderMessage } from '@/components/order/OrderMessage';
import { ItemDetailView } from '@/components/order/ItemDetailView';
import { getMenuItemById } from '@/lib/data/menu';

export default async function ItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ table?: string }>;
}) {
  const { id } = await params;
  const { table } = await searchParams;
  const tableNumber = Number(table);

  if (!table || !Number.isInteger(tableNumber) || tableNumber <= 0) {
    return (
      <OrderMessage
        title="Scan the QR code at your table"
        body="This link is missing a table number. Please scan the QR code on your table to start ordering."
      />
    );
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
