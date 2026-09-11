import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getCurrentAdmin } from '@/lib/data/admin';
import { LoginForm } from '@/components/admin/LoginForm';

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect('/admin/dashboard');

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-12 bg-[#09090b]">
      {/* Rooftop atmospheric ambient lighting */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(230,64,26,0.2),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(219,39,119,0.16),transparent_70%)] blur-3xl" />

      <div className="relative z-10 w-full max-w-sm space-y-6 luxury-card p-7 sm:p-8 rounded-3xl border border-white/10 shadow-2xl gold-glow">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Floating Mitron Brand Badge */}
          <div className="animate-float-y">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/15 shadow-[0_10px_28px_rgba(0,0,0,0.7),0_0_0_2px_rgba(255,255,255,0.08)]">
              <Image
                src="/mitron-logo.png"
                alt="Mitron Thane logo"
                fill
                sizes="80px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          <div>
            <h1 className="display text-4xl tracking-tight text-white sm:text-5xl">
              MITRON
            </h1>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="h-[1px] w-5 bg-gradient-to-r from-transparent to-[#f97316] opacity-75" />
              <span className="text-[10px] font-bold tracking-[0.25em] text-[#f97316]">
                STAFF PORTAL
              </span>
              <span className="h-[1px] w-5 bg-gradient-to-l from-transparent to-[#d946ef] opacity-75" />
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 font-medium">
              Live orders, kitchen &amp; table administration
            </p>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

