'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField, Input } from '@/components/ui/input';
import { useToast } from '@/components/ToastProvider';
import { api } from '@/lib/api';
import { saveSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({ username: username.trim(), password });
      saveSession(res.data.token, res.data.user);
      showToast({
        type: 'success',
        title: 'Login berhasil',
        message: `Selamat datang, ${res.data.user.username}`,
      });
      router.replace(res.data.user.role === 'PUSTAKAWAN' ? '/dashboard' : '/buku');
    } catch (err) {
      setError(err.message || 'Username atau password salah');
      showToast({
        type: 'error',
        title: 'Login gagal',
        message: err.message || 'Periksa kembali kredensial Anda',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Navy Branding Panel */}
      <div className="flex flex-col justify-between bg-navy p-8 text-white sm:p-12">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
            <Library className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="font-heading text-base font-semibold">TL Smart Campus Library</p>
            <p className="text-xs text-gray-300">Telkom University · Sistem Pustaka</p>
          </div>
        </div>

        <div className="my-10 space-y-6">
          <h1 className="font-heading text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Perpustakaan kampus, dalam satu sistem.
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-gray-300">
            Kelola katalog koleksi buku, data pemustaka, serta transaksi peminjaman dan pengembalian
            secara cepat dan terstruktur.
          </p>

          {/* Ilustrasi batang berwarna sesuai wireframe */}
          <div className="flex items-end gap-3 pt-4" aria-hidden="true">
            <div className="h-24 w-10 rounded-t-lg bg-brand" />
            <div className="h-32 w-10 rounded-t-lg bg-accent" />
            <div className="h-20 w-10 rounded-t-lg bg-navy-500" />
            <div className="h-28 w-10 rounded-t-lg bg-white/90" />
            <div className="h-16 w-10 rounded-t-lg bg-brand/80" />
          </div>
        </div>

        <p className="text-xs text-gray-400">
          CAK3EAB3 Komputasi Awan dan Terdistribusi · Kelompok Networking Ala Hilmi
        </p>
      </div>

      {/* Right Cream Form Panel */}
      <div className="flex items-center justify-center bg-cream p-6 sm:p-12">
        <Card className="w-full max-w-md p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-semibold text-navy">Masuk ke Akun</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Gunakan NIM/NIP atau email kampus yang terdaftar.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="NIM / NIP atau Email" required htmlFor="username">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: admin atau 1301210001"
                autoComplete="username"
              />
            </FormField>

            <FormField label="Password" required htmlFor="password">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() =>
                  showToast({
                    type: 'info',
                    title: 'Info Akun Demo',
                    message: 'Hubungi pustakawan atau gunakan akun demo: admin / admin123.',
                  })
                }
                className="font-heading text-xs font-medium text-navy-500 hover:text-brand"
              >
                Lupa password?
              </button>
            </div>

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Login
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-muted">
            Belum punya akun?{' '}
            <Link href="/register" className="font-heading font-semibold text-brand hover:underline">
              Daftar sekarang
            </Link>
          </p>

          <div className="mt-6 rounded-lg border border-ink-line bg-cream/70 p-3 text-xs text-ink-muted">
            <p className="font-heading font-semibold text-navy">Akun Demo:</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                }}
                className="rounded border border-ink-line bg-white px-2.5 py-1 hover:border-navy"
              >
                Pustakawan: <span className="font-mono">admin</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsername('1301210001');
                  setPassword('mahasiswa123');
                }}
                className="rounded border border-ink-line bg-white px-2.5 py-1 hover:border-navy"
              >
                Mahasiswa: <span className="font-mono">1301210001</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
