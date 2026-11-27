'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { clearSession, getStoredUser, getToken } from '@/lib/auth';

const PUSTAKAWAN_ONLY_PATHS = ['/dashboard', '/anggota', '/sirkulasi'];

export default function AppShellLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();

    if (!token || !stored) {
      clearSession();
      router.replace('/login');
      return;
    }

    if (
      stored.role !== 'PUSTAKAWAN' &&
      PUSTAKAWAN_ONLY_PATHS.some((prefix) => pathname.startsWith(prefix))
    ) {
      router.replace('/buku');
      return;
    }

    setUser(stored);
    setReady(true);
  }, [pathname, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar user={user} />
      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
