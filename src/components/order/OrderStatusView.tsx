'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRefetchOnFocus } from '@/lib/useRefetchOnFocus';
import { formatPrice } from '@/lib/format';
import {
  getNotificationPermission,
  isNotificationSupported,
  playReadyChime,
  showBrowserNotification,
  vibrateIfSupported,
} from '@/lib/alerts';
import { BellIcon, BellOffIcon, ClipboardIcon, SparkleIcon } from '@/components/icons';
import { OrderFeedbackForm } from './OrderFeedbackForm';
import { ServiceRequestButtons } from './ServiceRequestButtons';
import { InstallPromptBanner } from './InstallPromptBanner';
import type { OrderView } from '@/lib/data/orders';
import { getTableRunningTotal, type TableRunningTotal } from '@/lib/data/tableRunningTotal';
import { ensurePushSubscription } from '@/lib/push/subscribeClient';
import { subscribeToOrderPush } from '@/lib/actions/push';
import type { OrderStatus } from '@/types/database';

const STATUS_POLL_INTERVAL_MS = 20 * 1000;

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'placed', label: 'Placed' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'ready', label: 'Ready' },
  { status: 'served', label: 'Served' },
];

function StatusStepper({ status }: { status: OrderStatus }) {
  const currentIndex = STEPS.findIndex((s) => s.status === status);

  return (
    <div className="flex items-center justify-between px-1 sm:px-3 py-3">
      {STEPS.map((step, i) => {
        const isPassedOrCurrent = i <= currentIndex;
        return (
          <div key={step.status} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* Left connecting line */}
              <div
                className={`h-[2px] flex-1 ${
                  i === 0
                    ? 'invisible'
                    : i <= currentIndex
                    ? 'bg-[#ff6830]'
                    : 'bg-zinc-800'
                }`}
              />

              {/* Step indicator circle */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                  isPassedOrCurrent
                    ? 'bg-[#ff6830] text-black shadow-[0_2px_10px_rgba(255,104,48,0.45)]'
                    : 'border-2 border-zinc-800 bg-[#121215] text-transparent'
                }`}
              >
                {isPassedOrCurrent ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
              </div>

              {/* Right connecting line */}
              <div
                className={`h-[2px] flex-1 ${
                  i === STEPS.length - 1
                    ? 'invisible'
                    : i < currentIndex
                    ? 'bg-[#ff6830]'
                    : 'bg-zinc-800'
                }`}
              />
            </div>

            {/* Step Label */}
            <p
              className={`mt-2 text-xs font-bold text-center ${
                isPassedOrCurrent ? 'text-white' : 'text-zinc-500'
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function OrderStatusView({
  initialOrder,
  hasFeedback = false,
  runningTotal,
}: {
  initialOrder: OrderView;
  hasFeedback?: boolean;
  runningTotal?: TableRunningTotal;
}) {
  const [order, setOrder] = useState(initialOrder);
  const statusRef = useRef(order.status);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported' | null>(null);
  const [liveRunningTotal, setLiveRunningTotal] = useState(runningTotal);

  const tableLabel = `T-${order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}`;
  const shortOrderId = order.id.replace(/-/g, '').slice(0, 4).toUpperCase();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external browser API on mount
    setNotificationPermission(isNotificationSupported() ? getNotificationPermission() : 'unsupported');
  }, []);

  useEffect(() => {
    if (notificationPermission !== 'granted') return;
    let cancelled = false;
    ensurePushSubscription().then((sub) => {
      if (!cancelled && sub) void subscribeToOrderPush(order.id, sub);
    });
    return () => {
      cancelled = true;
    };
  }, [notificationPermission, order.id]);

  const applyStatusUpdate = useCallback(
    (next: { status: OrderStatus; served_at: string | null }) => {
      if (next.status === 'ready' && statusRef.current !== 'ready') {
        playReadyChime();
        vibrateIfSupported([200, 100, 200]);
        showBrowserNotification(
          'Your order is ready!',
          `Table ${order.tableNumber} — head to your table, staff is on the way.`,
          `order-ready-${order.id}`
        );
      }
      statusRef.current = next.status;
      setOrder((prev) => (prev.status === next.status && prev.servedAt === next.served_at ? prev : { ...prev, status: next.status, servedAt: next.served_at }));
    },
    [order.tableNumber, order.id]
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-status-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => {
          applyStatusUpdate(payload.new as { status: OrderStatus; served_at: string | null });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, applyStatusUpdate]);

  const refetchStatus = useCallback(async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from('orders').select('status, served_at').eq('id', order.id).maybeSingle();
      if (error) throw error;
      if (data) applyStatusUpdate(data);
    } catch (err) {
      console.error('Failed to refresh order status:', err);
    }
  }, [order.id, applyStatusUpdate]);

  const hasRunningTotal = runningTotal !== undefined;
  const refetchRunningTotal = useCallback(async () => {
    if (!hasRunningTotal) return;
    const supabase = createClient();
    try {
      const next = await getTableRunningTotal(order.tableNumber, supabase);
      setLiveRunningTotal(next);
    } catch (err) {
      console.error('Failed to refresh table running total:', err);
    }
  }, [order.tableNumber, hasRunningTotal]);

  const [tableId, setTableId] = useState<string | null>(null);
  useEffect(() => {
    if (!hasRunningTotal) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from('tables')
      .select('id')
      .eq('table_number', order.tableNumber)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setTableId(data.id);
      });
    return () => {
      cancelled = true;
    };
  }, [order.tableNumber, hasRunningTotal]);

  useEffect(() => {
    if (!tableId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`table-running-total-${tableId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `table_id=eq.${tableId}` },
        () => refetchRunningTotal()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tableId, refetchRunningTotal]);

  const refetchAll = useCallback(() => {
    refetchStatus();
    refetchRunningTotal();
  }, [refetchStatus, refetchRunningTotal]);

  useRefetchOnFocus(refetchAll);

  useEffect(() => {
    if (order.status === 'served') return;
    const interval = setInterval(refetchAll, STATUS_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [order.status, refetchAll]);

  const total = order.items.reduce((n, i) => n + i.priceAtOrder * i.quantity, 0);

  return (
    <div className="flex flex-col min-h-screen px-4 pt-3 pb-8 space-y-4">
      <InstallPromptBanner />

      {/* Top Header matching reference image: ORDER #0248  and  T-04 */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/order?table=${order.tableNumber}`}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18181c] border border-white/10 text-zinc-300 hover:text-white active:scale-95 transition-all shadow-sm"
            aria-label="Back to menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
            ORDER #{shortOrderId}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#18181c] border border-white/10 px-3.5 py-1 text-xs font-bold text-zinc-300">
            {tableLabel}
          </span>
        </div>
      </div>

      {/* Center Hero Status Section matching reference design */}
      <div className="flex flex-col items-center text-center pt-2 pb-1 space-y-2">
        {/* Gradient Icon Badge (Lightning bolt for preparing) */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#ff5722_0%,#e91e63_100%)] shadow-[0_10px_28px_rgba(255,87,34,0.4)] transition-all">
          {order.status === 'served' ? (
            <SparkleIcon className="h-7 w-7 text-black" />
          ) : order.status === 'ready' ? (
            <BellIcon className="h-7 w-7 text-black" />
          ) : order.status === 'preparing' ? (
            <svg className="h-7 w-7 text-black fill-current" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          ) : (
            <ClipboardIcon className="h-7 w-7 text-black" />
          )}
        </div>

        {/* Status Title */}
        <h1 className="display text-3xl sm:text-4xl text-white tracking-wider font-normal uppercase">
          {order.status === 'placed' ? 'ORDER PLACED' : order.status.toUpperCase()}
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-xs">
          {order.status === 'served'
            ? 'Thank you for dining with Mitron Thane. Enjoy your meal!'
            : order.status === 'ready'
            ? `Our staff is serving your items to Table ${order.tableNumber}.`
            : order.status === 'preparing'
            ? 'Your order is on the fire. Sit back and relax.'
            : 'Your order has reached the kitchen.'}
        </p>
      </div>

      {/* 4-Step Timeline Stepper matching reference design */}
      <StatusStepper status={order.status} />

      {notificationPermission === 'denied' ? (
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-amber-200/60 text-center">
          <BellOffIcon className="h-3 w-3 shrink-0" />
          Notifications are disabled in your browser.
        </p>
      ) : null}

      {/* "IN THIS ORDER" items list matching reference design */}
      <div className="space-y-2.5 pt-1">
        <p className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
          IN THIS ORDER
        </p>

        <div className="space-y-2.5">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/[0.07] bg-[#121215] px-4 py-3.5 flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xs font-bold text-zinc-400 shrink-0">
                  {item.quantity}×
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-bold text-white truncate">
                    {item.menuItemName}
                  </p>
                  {item.variantLabel ? (
                    <p className="text-xs text-zinc-400 font-normal">{item.variantLabel}</p>
                  ) : null}
                  {item.notes ? (
                    <p className="text-xs italic text-zinc-400">&ldquo;{item.notes}&rdquo;</p>
                  ) : null}
                </div>
              </div>

              <span className="text-sm sm:text-base font-black text-[#f97316] shrink-0 ml-3">
                {formatPrice(item.priceAtOrder * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bill summary & running total */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121215] p-4 space-y-2 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-zinc-400">Order Total</span>
          <span className="text-base font-black text-[#f97316]">{formatPrice(total)}</span>
        </div>

        {liveRunningTotal && liveRunningTotal.orderCount > 1 ? (
          <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between text-xs text-zinc-400">
            <span>Table {order.tableNumber} running total ({liveRunningTotal.orderCount} orders)</span>
            <span className="font-bold text-zinc-200">{formatPrice(liveRunningTotal.totalAmount)}</span>
          </div>
        ) : null}
      </div>

      {/* Service Request Buttons (Call for service / Request Bill) */}
      <div className="pt-1">
        <ServiceRequestButtons tableNumber={order.tableNumber} />
      </div>

      {/* Order feedback form (when served) */}
      {order.status === 'served' && !hasFeedback ? (
        <div className="pt-2">
          <OrderFeedbackForm orderId={order.id} />
        </div>
      ) : null}

      {/* Order more items from menu link */}
      <div className="text-center pt-2 pb-10">
        <Link
          href={`/order?table=${order.tableNumber}`}
          className="text-xs font-bold text-zinc-400 hover:text-[#ff6830] transition-colors"
        >
          + Order more items from menu
        </Link>
      </div>
    </div>
  );
}



