/**
 * Instant loading skeletons used by route-level loading.tsx files.
 *
 * Every customer route reads ?table= (dynamic), so without a loading.tsx
 * Next.js can't prefetch anything and a tap waits for the full server
 * render (Supabase queries included) before the screen changes. A
 * loading boundary is prefetched ahead of time and shown the moment the
 * user taps, while the real page streams in behind it.
 */

function Bar({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`} />;
}

function HeaderSkeleton() {
  return (
    <div className="glass-header sticky top-2 z-40 mx-3 my-2 flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 shadow-xl">
      <div className="flex items-center gap-3">
        <Bar className="h-9 w-9 rounded-full" />
        <Bar className="h-5 w-32" />
      </div>
      <Bar className="h-7 w-14" />
    </div>
  );
}

/** Menu list: header, category rail, item rows. */
export function MenuSkeleton() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-[#09090b]" aria-busy="true" aria-label="Loading menu">
      <HeaderSkeleton />
      <div className="flex gap-2 overflow-hidden px-4 pt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bar key={i} className="h-9 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bar key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3 px-4 pt-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-2xl border border-white/5 p-3">
            <Bar className="h-20 w-20 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2 py-1">
              <Bar className="h-4 w-3/4" />
              <Bar className="h-3 w-full" />
              <Bar className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Item detail: big image, title, description, add button. */
export function ItemSkeleton() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-[#09090b]" aria-busy="true" aria-label="Loading item">
      <HeaderSkeleton />
      <div className="space-y-4 px-4 pt-2">
        <Bar className="aspect-[4/3] w-full rounded-3xl" />
        <Bar className="h-7 w-2/3" />
        <Bar className="h-4 w-full" />
        <Bar className="h-4 w-5/6" />
        <Bar className="h-6 w-24" />
        <Bar className="mt-6 h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Generic page (cart, order status). */
export function PageSkeleton() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col bg-[#09090b]" aria-busy="true" aria-label="Loading">
      <HeaderSkeleton />
      <div className="space-y-3 px-4 pt-4">
        <Bar className="h-28 w-full rounded-2xl" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Bar key={i} className="h-20 w-full rounded-2xl" />
        ))}
        <Bar className="mt-4 h-14 w-full rounded-2xl" />
      </div>
    </div>
  );
}

/** Admin content area (rendered inside the admin layout, header stays). */
export function AdminSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Bar className="h-8 w-48" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
