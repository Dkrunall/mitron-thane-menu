'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createServiceRequest } from '@/lib/actions/serviceRequests';
import { BellIcon, CheckIcon, DocumentIcon, WarningIcon } from '@/components/icons';
import type { Database, ServiceRequestType } from '@/types/database';

type ServiceRequestRow = Database['public']['Tables']['service_requests']['Row'];

/**
 * Table-shared, realtime-synced "Call Waiter" / "Request Bill" buttons —
 * same pattern as the shared cart: any guest's device at the table sees
 * the pending state the instant anyone (including staff, via Acknowledge)
 * changes it, so nobody double-taps a request that's already in flight.
 */
export function ServiceRequestButtons({ tableNumber }: { tableNumber: number }) {
  const [pending, setPending] = useState<Record<ServiceRequestType, boolean>>({
    call_waiter: false,
    request_bill: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      const { data: table } = await supabase
        .from('tables')
        .select('id')
        .eq('table_number', tableNumber)
        .eq('is_active', true)
        .maybeSingle();
      if (cancelled || !table) return;

      const { data: rows } = await supabase
        .from('service_requests')
        .select('type')
        .eq('table_id', table.id)
        .eq('status', 'pending');
      if (cancelled) return;
      const rowTypes = new Set((rows ?? []).map((r) => r.type));
      setPending({ call_waiter: rowTypes.has('call_waiter'), request_bill: rowTypes.has('request_bill') });

      channel = supabase
        .channel(`service-requests-${table.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'service_requests', filter: `table_id=eq.${table.id}` },
          (payload) => {
            const row = (payload.new ?? payload.old) as ServiceRequestRow | undefined;
            if (!row) return;
            setPending((prev) => ({
              ...prev,
              [row.type]: payload.eventType !== 'DELETE' && (payload.new as ServiceRequestRow)?.status === 'pending',
            }));
          }
        )
        .subscribe();
    }

    init();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [tableNumber]);

  async function handleRequest(type: ServiceRequestType) {
    if (pending[type]) return;
    setError(null);
    setPending((prev) => ({ ...prev, [type]: true }));
    try {
      await createServiceRequest(tableNumber, type);
    } catch {
      setPending((prev) => ({ ...prev, [type]: false }));
      setError('Could not reach the kitchen. Please ask a staff member directly.');
    }
  }

  return (
    <div className="space-y-2.5">
      {/* Primary "Call for service" button matching reference design */}
      <button
        type="button"
        onClick={() => handleRequest('call_waiter')}
        disabled={pending.call_waiter}
        className={`w-full rounded-2xl border py-3.5 px-5 flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer ${
          pending.call_waiter
            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300 cursor-default'
            : 'border-[#ff6830]/40 bg-[#161212] hover:bg-[#1f1614] text-[#ff8a3d] active:scale-[0.99] shadow-sm'
        }`}
      >
        {pending.call_waiter ? (
          <>
            <CheckIcon className="h-4 w-4 text-emerald-400" />
            <span>Waiter Notified</span>
          </>
        ) : (
          <>
            <BellIcon className="h-4 w-4 text-[#ff8a3d]" />
            <span>Call for service</span>
          </>
        )}
      </button>

      {/* Secondary "Request Bill" button */}
      <button
        type="button"
        onClick={() => handleRequest('request_bill')}
        disabled={pending.request_bill}
        className={`w-full rounded-2xl border py-2.5 px-4 flex items-center justify-center gap-2 font-bold text-xs text-zinc-400 transition-all cursor-pointer ${
          pending.request_bill
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default'
            : 'border-white/[0.07] bg-[#121215] hover:bg-[#18181f] text-zinc-300 hover:text-white active:scale-[0.99]'
        }`}
      >
        {pending.request_bill ? (
          <>
            <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Bill Requested</span>
          </>
        ) : (
          <>
            <DocumentIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span>Request Bill</span>
          </>
        )}
      </button>

      {error ? (
        <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-rose-400 pt-1">
          <WarningIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

