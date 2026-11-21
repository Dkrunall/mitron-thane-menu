// Kept out of any 'use server' module — Next.js only allows async function
// exports from Server Action files, and exporting a class breaks the
// client bundle for that module.
import { unstable_rethrow } from 'next/navigation';

/**
 * Throw this inside a Server Action for a message that's safe (and meant)
 * to reach the person on screen. Anything else (raw DB errors, etc.) is
 * swapped for a generic message so internals never leak.
 */
export class ActionError extends Error {}

/**
 * What every Server Action returns. Errors are *returned*, never thrown to
 * the browser: in a production build Next.js replaces a thrown Server
 * Action error with a redacted "Minified React error #441" message, so a
 * reason like "Incorrect email or password" would never reach the screen.
 */
export type ActionResult = { error: string | null };

/** Server side: runs an action body and turns any failure into a result.
 *  redirect()/notFound() still propagate, so a successful action can
 *  navigate. */
export async function toActionResult(
  fn: () => Promise<unknown>,
  fallback: string,
  label: string
): Promise<ActionResult> {
  try {
    await fn();
    return { error: null };
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof ActionError) return { error: err.message };
    console.error(`${label} failed:`, err);
    return { error: fallback };
  }
}

/** Client side: turns a returned error back into a thrown Error, so a
 *  caller's existing try/catch shows it. */
export function throwIfActionError(result: ActionResult | undefined | void): void {
  if (result && result.error) throw new Error(result.error);
}
