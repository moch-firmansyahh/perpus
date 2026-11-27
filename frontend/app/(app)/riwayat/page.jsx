'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DataTable } from '@/components/DataTable';
import { FormDialog } from '@/components/FormDialog';
import { SearchBar } from '@/components/SearchBar';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField, Input, Select } from '@/components/ui/input';
import { api } from '@/lib/api';
import { getStoredUser, getToken } from '@/lib/auth';
import { formatDate, formatRupiah } from '@/lib/format';

export default function RiwayatPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ status: 'DIPINJAM', batasKembali: '', denda: '0' });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const isPustakawan = user?.role === 'PUSTAKAWAN';

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listPeminjaman({ search, status: statusFilter }, getToken());
      setLoans(res.data || []);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal memuat riwayat',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showToast]);

  useEffect(() => {
    loadLoans();
  }, [loadLoans]);

  const openEdit = (loan) => {
    setEditing(loan);
    setEditForm({
      status: loan.status,
      batasKembali: loan.batasKembali ? loan.batasKembali.slice(0, 10) : '',
      denda: String(loan.denda ?? 0),
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.updatePeminjaman(
        editing.id,
        {
          status: editForm.status,
          batasKembali: editForm.batasKembali
            ? new Date(`${editForm.batasKembali}T12:00:00.000Z`).toISOString()
            : undefined,
          denda: Number(editForm.denda) || 0,
        },
        getToken()
      );
      showToast({
        type: 'success',
        title: 'Transaksi diperbarui',
        message: `Data ${editing.kodePeminjaman} berhasil disimpan.`,
      });
      setEditing(null);
      await loadLoans();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal memperbarui transaksi',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deletePeminjaman(deleteTarget.id, getToken());
      showToast({
        type: 'success',
        title: 'Arsip peminjaman dihapus',
        message: `${deleteTarget.kodePeminjaman} telah dihapus.`,
      });
      setDeleteTarget(null);
      await loadLoans();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal menghapus arsip',
        message: err.message,
      });
    } finally {
      setDeleting(false);
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
      key: 'tanggalPinjam',
      label: 'Tgl Pinjam',
      render: (r) => formatDate(r.tanggalPinjam),
    },
    {
      key: 'batasKembali',
      label: 'Batas Kembali',
      render: (r) => formatDate(r.batasKembali),
    },
    {
      key: 'tanggalKembali',
      label: 'Tgl Kembali',
      render: (r) => formatDate(r.tanggalKembali),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: 'denda',
      label: 'Denda',
      render: (r) => (
        <span className={r.denda > 0 ? 'font-semibold text-danger' : 'text-ink-muted'}>
          {formatRupiah(r.denda)}
        </span>
      ),
    },
    ...(isPustakawan
      ? [
          {
            key: 'aksi',
            label: 'Aksi',
            render: (r) => (
              <div className="flex items-center gap-2">
                <Button variant="neutral" size="sm" onClick={() => openEdit(r)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Ubah
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(r)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
          Riwayat Peminjaman
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {isPustakawan
            ? 'Seluruh arsip transaksi peminjaman, keterlambatan, dan denda perpustakaan.'
            : 'Daftar riwayat peminjaman pribadi Anda beserta tenggat dan estimasi denda.'}
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari kode transaksi, peminjam, atau judul buku..."
          />
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter status peminjaman"
            >
              <option value="">Semua Status</option>
              <option value="DIPINJAM">Dipinjam</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="DIKEMBALIKAN">Dikembalikan</option>
            </Select>
          </div>
          <Button variant="neutral" onClick={loadLoans}>
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          rows={loans}
          loading={loading}
          emptyTitle="Belum ada riwayat peminjaman"
          emptyDescription="Transaksi peminjaman yang tercatat akan muncul di tabel ini."
        />
      </Card>

      <FormDialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSubmit={handleSave}
        loading={saving}
        title={editing ? `Ubah Peminjaman (${editing.kodePeminjaman})` : 'Ubah Peminjaman'}
        submitLabel="Simpan Perubahan"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <FormField label="Status" htmlFor="loan-status">
            <Select
              id="loan-status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="DIPINJAM">DIPINJAM</option>
              <option value="TERLAMBAT">TERLAMBAT</option>
              <option value="DIKEMBALIKAN">DIKEMBALIKAN</option>
            </Select>
          </FormField>

          <FormField label="Batas Kembali" htmlFor="loan-batas">
            <Input
              id="loan-batas"
              type="date"
              value={editForm.batasKembali}
              onChange={(e) => setEditForm({ ...editForm, batasKembali: e.target.value })}
            />
          </FormField>

          <FormField label="Koreksi Denda (Rp)" htmlFor="loan-denda">
            <Input
              id="loan-denda"
              type="number"
              min="0"
              value={editForm.denda}
              onChange={(e) => setEditForm({ ...editForm, denda: e.target.value })}
            />
          </FormField>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Arsip Peminjaman"
        confirmLabel="Hapus Arsip"
        message={
          deleteTarget
            ? `Hapus arsip ${deleteTarget.kodePeminjaman}? Jika peminjaman masih aktif, stok buku akan dipulihkan (+1).`
            : ''
        }
      />
    </div>
  );
}
