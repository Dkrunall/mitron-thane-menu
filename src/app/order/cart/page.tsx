import { normalizeTableLabel } from '@/lib/tableLabel';
import { OrderFrame } from '@/components/order/OrderShell';
import { OrderMessage } from '@/components/order/OrderMessage';
import { CartReview } from '@/components/order/CartReview';

export default async function CartPage({
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

  return (
    <OrderFrame tableNumber={tableNumber} showCartBar={false}>
      <CartReview tableNumber={tableNumber} />
    </OrderFrame>
  );
}

