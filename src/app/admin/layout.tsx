import type { Metadata } from 'next';

// Staff get their own home-screen app ("Mitron Staff") that opens straight
// to Live Orders — with the customer manifest, "Add to Home Screen" from
// the admin pages would open the guest menu instead.
export const metadata: Metadata = {
  manifest: '/admin.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mitron Staff',
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
