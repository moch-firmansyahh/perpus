'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField, Input } from '@/components/ui/input';
import { useToast } from '@/components/ToastProvider';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    nama: '',
    nim: '',
    noTelepon: '',
    email: '',
    jurusan: '',
    password: '',
    konfirmasiPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.nama.trim()) next.nama = 'Nama lengkap wajib diisi';
    if (!form.nim.trim()) next.nim = 'NIM/NIP wajib diisi';
    if (!form.email.trim()) next.email = 'Email kampus wajib diisi';
    if (form.password.length < 8) next.password = 'Password minimal 8 karakter';
    if (form.password !== form.konfirmasiPassword) {
      next.konfirmasiPassword = 'Konfirmasi password tidak cocok';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.register(form);
      showToast({
        type: 'success',
        title: 'Registrasi berhasil',
        message: 'Akun mahasiswa berhasil dibuat. Silakan login.',
      });
      router.push('/login');
    } catch (err) {
      if (Array.isArray(err.errors)) {
        const mapped = {};
        err.errors.forEach((item) => {
          mapped[item.field] = item.message;
        });
        setErrors(mapped);
      }
      showToast({
        type: 'error',
        title: 'Registrasi gagal',
        message: err.message || 'Periksa kembali data yang dimasukkan',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Navy Info Panel */}
      <div className="flex flex-col justify-between bg-navy p-8 text-white sm:p-12">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
            <Library className="h-5 w-5 text-white" />
          </span>
          <div>
            <p className="font-heading text-base font-semibold">TL Smart Campus Library</p>
            <p className="text-xs text-gray-300">Telkom University · Registrasi Pemustaka</p>
          </div>
        </div>

        <div className="my-10 space-y-6">
          <h1 className="font-heading text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Satu akun untuk seluruh layanan pustaka.
          </h1>
          <ul className="space-y-4 text-sm text-gray-200">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span>Cek ketersediaan stok buku kampus secara real-time sebelum berkunjung.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span>Pinjam buku langsung dengan validasi status keanggotaan otomatis.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <span>Pantau tenggat pengembalian dan riwayat transaksi pribadi Anda.</span>
            </li>
          </ul>
        </div>

        <p className="text-xs text-gray-400">
          Sudah punya akun? Login dengan NIM yang didaftarkan.
        </p>
      </div>

      {/* Right Cream Form Panel */}
      <div className="flex items-center justify-center bg-cream p-6 sm:p-10">
        <Card className="w-full max-w-lg p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-heading text-2xl font-semibold text-navy">Daftar Akun Mahasiswa</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Lengkapi data diri untuk aktivasi keanggotaan perpustakaan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nama Lengkap" required error={errors.nama} htmlFor="nama">
              <Input
                id="nama"
                value={form.nama}
                onChange={(e) => setField('nama', e.target.value)}
                placeholder="Citra Lestari"
                error={errors.nama}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="NIM / NIP" required error={errors.nim} htmlFor="nim">
                <Input
                  id="nim"
                  value={form.nim}
                  onChange={(e) => setField('nim', e.target.value)}
                  placeholder="1301210004"
                  error={errors.nim}
                />
              </FormField>
              <FormField label="No. Telepon" error={errors.noTelepon} htmlFor="noTelepon">
                <Input
                  id="noTelepon"
                  value={form.noTelepon}
                  onChange={(e) => setField('noTelepon', e.target.value)}
                  placeholder="081234567890"
                  error={errors.noTelepon}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email Kampus" required error={errors.email} htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  placeholder="citra@student.telkomuniversity.ac.id"
                  error={errors.email}
                />
              </FormField>
              <FormField label="Jurusan / Prodi" error={errors.jurusan} htmlFor="jurusan">
                <Input
                  id="jurusan"
                  value={form.jurusan}
                  onChange={(e) => setField('jurusan', e.target.value)}
                  placeholder="Informatika"
                  error={errors.jurusan}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Password" required error={errors.password} htmlFor="reg-password">
                <Input
                  id="reg-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  placeholder="Minimal 8 karakter"
                  error={errors.password}
                />
              </FormField>
              <FormField
                label="Konfirmasi Password"
                required
                error={errors.konfirmasiPassword}
                htmlFor="konfirmasiPassword"
              >
                <Input
                  id="konfirmasiPassword"
                  type="password"
                  value={form.konfirmasiPassword}
                  onChange={(e) => setField('konfirmasiPassword', e.target.value)}
                  placeholder="Ulangi password"
                  error={errors.konfirmasiPassword}
                />
              </FormField>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Daftar
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-muted">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-heading font-semibold text-brand hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
