'use client';

import { useTransition } from 'react';
import { signOut } from '@/lib/actions/auth';
import { unsubscribeStaffPush } from '@/lib/actions/push';

/**
 * Signing out also stops background order alerts on this phone, so a
 * shared device doesn't keep buzzing for someone who has left. The
 * browser's push subscription itself is kept (a guest order-ready alert
 * on the same phone uses it too) — only the staff registration is removed.
 */
export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker?.getRegistration();
        const subscription = await registration?.pushManager?.getSubscription();
        if (subscription) await unsubscribeStaffPush(subscription.endpoint);
      } catch {
        // Never block sign-out on this.
      }
      await signOut();
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-zinc-200 hover:text-white active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-60"
    >
      {isPending ? 'Signing out…' : 'Sign Out'}
    </button>
  );
}
