import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only admin routes use Supabase Auth. Running the session refresh (a
  // network round-trip to Supabase) on customer pages added latency to
  // every tap and prefetch for guests who are never logged in.
  matcher: ['/admin/:path*'],
};
