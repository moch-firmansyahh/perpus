'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftRight, Info } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FormField, Input, Select } from '@/components/ui/input';
import { api } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { formatDate, formatRupiah } from '@/lib/format';

export default function SirkulasiPage() {
  const { showToast } = useToast();
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [anggotaId, setAnggotaId] = useState('');
  const [bukuId, setBukuId] = useState('');
  const [durasiHari, setDurasiHari] = useState('7');
  const [submitting, setSubmitting] = useState(false);

  const [returnTarget, setReturnTarget] = useState(null);
  const [returning, setReturning] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      const [mRes, bRes, rRes] = await Promise.all([
        api.listAnggota({}, token),
        api.listBuku({}, token),
        api.ringkasan(token),
      ]);
      const mList = mRes.data || [];
      const bList = bRes.data || [];
      setMembers(mList);
      setBooks(bList);
      setActiveLoans(rRes.data?.peminjamanBerjalan || []);

      setAnggotaId((prev) => prev || mList[0]?.id || '');
      setBukuId((prev) => prev || bList.find((b) => b.tersedia > 0)?.id || bList[0]?.id || '');
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal memuat data sirkulasi',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!anggotaId || !bukuId) {
      showToast({
        type: 'error',
        title: 'Data belum lengkap',
        message: 'Pilih anggota dan buku terlebih dahulu.',
      });
      return;
    }

    const parsedDurasi = durasiHari === '' ? 7 : Number(durasiHari);
    if (!Number.isInteger(parsedDurasi) || parsedDurasi < 1 || parsedDurasi > 30) {
      showToast({
        type: 'error',
        title: 'Durasi tidak valid',
        message: 'Durasi peminjaman harus bilangan bulat 1–30 hari.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.pinjam(
        {
          anggotaId,
          bukuId,
          durasiHari: parsedDurasi,
        },
        getToken()
      );
      showToast({
        type: 'success',
        title: 'Checkout berhasil',
        message: `Kode transaksi ${res.data.kodePeminjaman} tercatat.`,
      });
      await loadAll();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Checkout ditolak',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!returnTarget) return;
    setReturning(true);
    try {
      const res = await api.kembali(returnTarget.id, getToken());
      const denda = res.data?.denda || 0;
      showToast({
        type: 'success',
        title: 'Pengembalian berhasil',
        message:
          denda > 0
            ? `Stok pulih. Denda keterlambatan: ${formatRupiah(denda)}`
            : 'Stok buku pulih tanpa denda.',
      });
      setReturnTarget(null);
      await loadAll();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal mengembalikan buku',
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
    {
      key: 'anggotaNama',
      label: 'Peminjam & Buku',
      render: (r) => (
        <div>
          <p className="font-medium text-navy">{r.bukuJudul}</p>
          <p className="text-xs text-ink-muted">{r.anggotaNama}</p>
        </div>
      ),
    },
    {
      key: 'batasKembali',
      label: 'Batas Kembali',
      render: (r) => formatDate(r.batasKembali),
    },
    {
      key: 'status',
      label: 'Status & Denda',
      render: (r) => (
        <div className="space-y-1">
          <StatusBadge status={r.status} />
          {r.denda > 0 && (
            <p className="text-xs font-semibold text-danger">{formatRupiah(r.denda)}</p>
          )}
        </div>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (r) => (
        <Button variant="outline" size="sm" onClick={() => setReturnTarget(r)}>
          Proses Pengembalian
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
          Sirkulasi Peminjaman & Pengembalian
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Transaksi lintas entitas (Anggota + Buku + Peminjaman) dengan validasi stok dan denda otomatis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Checkout Form + Business Rules */}
        <div className="space-y-4 lg:col-span-5">
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg font-semibold text-navy">
                Form Checkout Peminjaman
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <FormField label="Pilih Anggota" required htmlFor="circ-anggota">
                  <Select
                    id="circ-anggota"
                    value={anggotaId}
                    onChange={(e) => setAnggotaId(e.target.value)}
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id} — {m.nama} ({m.nim}){m.statusAktif ? '' : ' [Nonaktif]'}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Pilih Buku" required htmlFor="circ-buku">
                  <Select
                    id="circ-buku"
                    value={bukuId}
                    onChange={(e) => setBukuId(e.target.value)}
                  >
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} — {b.judul} ({b.tersedia}/{b.stok} tersedia)
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Durasi Peminjaman (Hari)" required htmlFor="circ-durasi">
                  <Input
                    id="circ-durasi"
                    type="number"
                    min="1"
                    max="30"
                    value={durasiHari}
                    onChange={(e) => setDurasiHari(e.target.value)}
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={submitting}
                  className="w-full"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Eksekusi Checkout
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-navy/15 bg-navy/[0.03] p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
              <div className="space-y-1.5 text-xs text-ink-muted">
                <p className="font-heading text-sm font-semibold text-navy">Logika Bisnis</p>
                <p>• Durasi standar 7 hari (rentang valid 1–30 hari).</p>
                <p>• Ditolak bila anggota tidak aktif atau stok tersedia = 0.</p>
                <p>• Checkout mengurangi stok tersedia (-1) secara sinkron.</p>
                <p>• Keterlambatan dikenakan denda Rp2.000 per hari.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Active Loans */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <h2 className="font-heading text-lg font-semibold text-navy">
                Daftar Peminjaman Aktif ({activeLoans.length})
              </h2>
              <p className="text-xs text-ink-muted">
                Klik &quot;Proses Pengembalian&quot; untuk memulihkan stok dan menghitung denda final.
              </p>
            </CardHeader>
            <DataTable
              columns={columns}
              rows={activeLoans}
              loading={loading}
              emptyTitle="Belum ada peminjaman aktif"
              emptyDescription="Gunakan form di samping untuk mencatat checkout baru."
            />
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleReturn}
        loading={returning}
        variant="outline"
        title="Proses Pengembalian Buku"
        confirmLabel="Selesaikan Pengembalian"
        message={
          returnTarget
            ? `Konfirmasi pengembalian "${returnTarget.bukuJudul}" oleh ${returnTarget.anggotaNama}?${
                returnTarget.denda > 0
                  ? ` Total denda keterlambatan: ${formatRupiah(returnTarget.denda)}.`
                  : ''
              }`
            : ''
        }
      />
    </div>
  );
}
