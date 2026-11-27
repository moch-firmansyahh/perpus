'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeftRight,
  BookOpen,
  History,
  LayoutDashboard,
  Library,
  LogOut,
  Users,
} from 'lucide-react';
import { BackendStatus } from '@/components/BackendStatus';
import { clearSession } from '@/lib/auth';
import { cn } from '@/lib/utils';

const PUSTAKAWAN_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/buku', label: 'Katalog Buku', icon: BookOpen },
  { href: '/anggota', label: 'Data Anggota', icon: Users },
  { href: '/sirkulasi', label: 'Sirkulasi', icon: ArrowLeftRight },
  { href: '/riwayat', label: 'Riwayat', icon: History },
];

const MAHASISWA_LINKS = [
  { href: '/buku', label: 'Katalog Buku', icon: BookOpen },
  { href: '/riwayat', label: 'Riwayat', icon: History },
];

export function Navbar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPustakawan = user?.role === 'PUSTAKAWAN';
  const links = isPustakawan ? PUSTAKAWAN_LINKS : MAHASISWA_LINKS;

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-navy-700 bg-navy text-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={isPustakawan ? '/dashboard' : '/buku'}
            className="flex items-center gap-2.5 font-heading text-base font-semibold text-white"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
              <Library className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span>TL Smart Campus Library</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {links.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-heading text-xs font-medium transition-colors',
                    active
                      ? 'bg-brand text-white'
                      : 'text-gray-200 hover:bg-navy-700 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <BackendStatus />
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-navy-700 px-3 py-1.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent font-heading text-xs font-bold text-navy">
              {(user?.username || 'U').slice(0, 1).toUpperCase()}
            </span>
            <div className="hidden text-left leading-tight sm:block">
              <p className="font-heading text-xs font-medium text-white">{user?.username}</p>
              <p className="text-[10px] text-gray-300">{user?.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-500 px-2.5 py-1.5 font-heading text-xs font-medium text-gray-200 hover:bg-navy-700 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      <nav
        className="flex items-center gap-1 overflow-x-auto border-t border-navy-700 px-4 py-2 md:hidden"
        aria-label="Navigasi mobile"
      >
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-heading text-xs font-medium',
                active ? 'bg-brand text-white' : 'text-gray-200 hover:bg-navy-700'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
