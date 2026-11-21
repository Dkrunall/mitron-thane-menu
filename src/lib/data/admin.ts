import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { AdminRole } from '@/types/database';

export interface CurrentAdmin {
  id: string;
  email: string;
  role: AdminRole;
}

/** Thrown when Supabase can't be reached or rate-limits us. Then we don't
 *  know whether the person is signed in, so the page shows a "try again"
 *  screen instead of sending them to the login page. Before, a slow or
 *  throttled auth check counted as "logged out": the dashboard sent people
 *  to /admin/login, the login page then found the session and sent them
 *  back, and the browser gave up with "too many redirects". */
export class AuthUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Could not check your sign-in right now. Please try again.');
    this.name = 'AuthUnavailableError';
    this.cause = cause;
  }
}

function isTransientAuthError(error: { status?: number; name?: string } | null): boolean {
  if (!error) return false;
  // No/expired/revoked session is a normal "logged out", not an outage.
  if (error.name === 'AuthSessionMissingError') return false;
  const status = error.status ?? 0;
  return status === 0 || status === 429 || status >= 500;
}

/**
 * Returns the signed-in admin, or null if not logged in / not an admin.
 * Throws AuthUnavailableError when that can't be decided (network trouble).
 *
 * Wrapped in React cache(): the layout and the page both call this during
 * one request, and each call used to be a separate round trip to Supabase
 * Auth (plus the proxy's own) — needless load that counts against
 * Supabase's per-IP rate limits, since every server request comes from the
 * host's single IP address.
 */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (!user) {
    if (isTransientAuthError(userError)) throw new AuthUnavailableError(userError);
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from('admin_users')
    .select('id, email, role')
    .eq('id', user.id)
    .maybeSingle();
  if (adminError) throw new AuthUnavailableError(adminError);

  return admin;
});
