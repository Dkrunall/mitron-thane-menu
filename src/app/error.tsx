'use client';

import { ErrorScreen } from '@/components/ErrorScreen';

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex min-h-screen flex-1 items-start justify-center bg-[#09090b] px-4">
      <ErrorScreen error={error} retry={retry} homeHref="/" homeLabel="Home" />
    </div>
  );
}
