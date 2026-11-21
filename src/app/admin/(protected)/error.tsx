'use client';

import { ErrorScreen } from '@/components/ErrorScreen';

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorScreen error={error} retry={retry} homeHref="/admin/dashboard" homeLabel="Live Orders" />;
}
