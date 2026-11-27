'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookCheck,
  BookOpen,
  Clock,
  Plus,
  Users,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DataTable } from '@/components/DataTable';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { formatDate, formatRupiah } from '@/lib/format';

export default function DashboardPage() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnTarget, setReturnTarget] = useState(null);
  const [returning, setReturning] = useState(false);

  const loadRingkasan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.ringkasan(getToken());
      setData(res.data);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal memuat dashboard',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadRingkasan();
  }, [loadRingkasan]);

  const handleReturn = async () => {
    if (!returnTarget) return;
    setReturning(true);
    try {
      const res = await api.kembali(returnTarget.id, getToken());
      const denda = res.data?.denda || 0;
      showToast({
        type: 'success',
        title: 'Buku dikembalikan',
        message:
          denda > 0
            ? `Pengembalian berhasil. Denda keterlambatan: ${formatRupiah(denda)}`
            : 'Pengembalian berhasil tanpa denda.',
      });
      setReturnTarget(null);
      await loadRingkasan();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal memproses pengembalian',
        message: err.message,
      });
    } finally {
      setReturning(false);
    }
  };

  const columns = [
    {
      key: 'kodePeminjaman',
      label: 'Kode',
      render: (r) => <span className="font-mono text-xs text-navy">{r.kodePeminjaman}</span>,
    },
    { key: 'anggotaNama', label: 'Peminjam' },
    {
      key: 'bukuJudul',
      label: 'Judul Buku',
      render: (r) => <span className="font-medium text-navy">{r.bukuJudul}</span>,
    },
    {
      key: 'batasKembali',
      label: 'Tenggat',
      render: (r) => formatDate(r.batasKembali),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={r.status} />
          {r.denda > 0 && (
            <span className="text-xs font-medium text-danger">{formatRupiah(r.denda)}</span>
          )}
        </div>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (r) => (
        <Button variant="outline" size="sm" onClick={() => setReturnTarget(r)}>
          Kembalikan
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
            Dashboard Perpustakaan
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Ringkasan koleksi buku, pemustaka aktif, dan peminjaman berjalan.
          </p>
        </div>
        <Link href="/sirkulasi">
          <Button variant="primary">
            <Plus className="h-4 w-4" />
            Catat Peminjaman
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Total Koleksi"
          value={loading ? '...' : data?.totalJudul ?? 0}
          hint={loading ? '' : `${data?.totalEksemplar ?? 0} total eksemplar`}
          tone="navy"
        />
        <StatCard
          icon={BookCheck}
          label="Siap Dipinjam"
          value={loading ? '...' : data?.eksemplarTersedia ?? 0}
          hint="Eksemplar tersedia di rak"
          tone="success"
        />
        <StatCard
          icon={Users}
          label="Pemustaka"
          value={loading ? '...' : data?.anggotaTerdaftar ?? 0}
          hint={loading ? '' : `${data?.anggotaAktif ?? 0} anggota aktif`}
          tone="accent"
        />
        <StatCard
          icon={Clock}
          label="Peminjaman Aktif"
          value={loading ? '...' : data?.peminjamanAktif ?? 0}
          hint={loading ? '' : `${data?.peminjamanTerlambat ?? 0} transaksi terlambat`}
          tone="brand"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-navy">
              Peminjaman Sedang Berlangsung
            </h2>
            <p className="text-xs text-ink-muted">
              Daftar transaksi aktif yang belum dikembalikan.
            </p>
          </div>
          <Link
            href="/riwayat"
            className="inline-flex items-center gap-1 font-heading text-xs font-semibold text-brand hover:underline"
          >
            Lihat semua riwayat
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>

        <DataTable
          columns={columns}
          rows={data?.peminjamanBerjalan || []}
          loading={loading}
          emptyTitle="Tidak ada peminjaman aktif"
          emptyDescription="Semua koleksi buku saat ini berada di perpustakaan."
        />
      </Card>

      <ConfirmDialog
        open={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturn}
        loading={returning}
        variant="outline"
        title="Konfirmasi Pengembalian Buku"
        confirmLabel="Proses Pengembalian"
        message={
          returnTarget
            ? `Proses pengembalian buku "${returnTarget.bukuJudul}" oleh ${returnTarget.anggotaNama}?${
                returnTarget.denda > 0
                  ? ` Estimasi denda keterlambatan: ${formatRupiah(returnTarget.denda)}.`
                  : ''
              }`
            : ''
        }
      />
    </div>
  );
}
