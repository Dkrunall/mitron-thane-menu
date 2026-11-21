'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ActionError, toActionResult, type ActionResult } from '@/lib/actions/errors';

const GENERIC_FAILURE_MESSAGE = 'Something went wrong signing in. Please try again.';

export async function signIn(email: string, password: string): Promise<ActionResult> {
  return toActionResult(() => signInUnsafe(email, password), GENERIC_FAILURE_MESSAGE, 'signIn');
}

async function signInUnsafe(email: string, password: string) {
  if (!email || !password) throw new ActionError('Enter your email and password.');

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    // Supabase Auth limits sign-in attempts; say so instead of blaming the password.
    if (error.status === 429 || error.code === 'over_request_rate_limit') {
      throw new ActionError('Too many sign-in attempts. Please wait a few minutes and try again.');
    }
    if (error.code === 'invalid_credentials' || error.status === 400) {
      throw new ActionError('Incorrect email or password.');
    }
    console.error('signInWithPassword failed:', error);
    throw new ActionError('Could not reach the sign-in service. Check the connection and try again.');
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    throw new ActionError('This account is not set up as an admin.');
  }

  redirect('/admin/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
