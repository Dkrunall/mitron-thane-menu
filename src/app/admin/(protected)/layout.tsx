import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getCurrentAdmin } from '@/lib/data/admin';
import { signOut } from '@/lib/actions/auth';
import { AdminNavBar } from '@/components/admin/AdminNavBar';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect('/admin/login');

  const navLinks = [
    { href: '/admin/dashboard', label: 'Live Orders' },
    ...(admin.role === 'manager'
      ? [
          { href: '/admin/menu', label: 'Menu Items' },
          { href: '/admin/tables', label: 'Tables & QR' },
          { href: '/admin/history', label: 'History' },
        ]
      : []),
  ];

  return (
    <div className="relative flex min-h-screen flex-1 flex-col bg-[#09090b] text-zinc-100">
      {/* Subtle atmospheric ambient glow matching client rooftop */}
      <div className="pointer-events-none fixed -left-20 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(230,64,26,0.12),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none fixed -right-20 top-40 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(233,1,151,0.08),transparent_70%)] blur-3xl" />

      <header className="glass-header sticky top-0 z-30 border-b border-white/10 bg-[#121215]/90 backdrop-blur-xl shadow-xl">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2.5 sm:gap-4">
            {/* Logo & Brand */}
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.5)] gold-glow-sm">
                <Image
                  src="/mitron-logo.png"
                  alt="Mitron Thane logo"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs sm:text-sm font-extrabold tracking-tight text-white">
                    MITRON
                  </span>
                  <span className="text-[10px] font-bold tracking-widest text-[#ff8a3d] uppercase">
                    ADMIN
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e]" />
                  <p className="truncate text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                    {admin.role} portal
                  </p>
                </div>
              </div>
            </div>

            {/* Profile info & Sign Out */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden md:inline-block glass-pill px-3 py-1 rounded-full text-xs font-medium text-zinc-400 border border-white/10">
                {admin.email}
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/10 px-3.5 sm:px-4 py-1.5 text-xs font-bold text-zinc-200 hover:text-white active:scale-95 transition-all cursor-pointer shadow-sm"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* Horizontally scrollable minimal navigation strip with active route indicator */}
          <AdminNavBar navLinks={navLinks} />
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-3.5 sm:px-6 py-4 sm:py-6">{children}</main>
    </div>
  );
}

