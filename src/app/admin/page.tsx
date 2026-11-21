import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '@/lib/data/admin';

export default async function AdminIndexPage() {
  const admin = await getCurrentAdmin().catch(() => null);
  redirect(admin ? '/admin/dashboard' : '/admin/login');
}
