'use client';

import { useCallback, useEffect, useState } from 'react';
import { Pencil, RefreshCw, Trash2, UserPlus } from 'lucide-react';
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
import { getToken } from '@/lib/auth';

const EMPTY_FORM = {
  nim: '',
  nama: '',
  email: '',
  jurusan: '',
  noTelepon: '',
  statusAktif: true,
};

export default function AnggotaPage() {
  const { showToast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [aktifFilter, setAktifFilter] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listAnggota({ search, aktif: aktifFilter }, getToken());
      setMembers(res.data || []);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal memuat data anggota',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [search, aktifFilter, showToast]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (member) => {
    setEditing(member);
    setForm({
      nim: member.nim || '',
      nama: member.nama || '',
      email: member.email || '',
      jurusan: member.jurusan || '',
      noTelepon: member.noTelepon || '',
      statusAktif: Boolean(member.statusAktif),
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSave = async () => {
    const nextErr = {};
    if (!form.nim.trim()) nextErr.nim = 'NIM/NIP wajib diisi';
    if (!form.nama.trim()) nextErr.nama = 'Nama wajib diisi';
    if (!form.email.trim()) nextErr.email = 'Email wajib diisi';
    setFormErrors(nextErr);
    if (Object.keys(nextErr).length > 0) return;

    const payload = {
      nim: form.nim.trim(),
      nama: form.nama.trim(),
      email: form.email.trim(),
      jurusan: form.jurusan.trim(),
      noTelepon: form.noTelepon.trim(),
      statusAktif: form.statusAktif,
    };

    setSaving(true);
    try {
      if (editing) {
        await api.updateAnggota(editing.id, payload, getToken());
        showToast({
          type: 'success',
          title: 'Anggota diperbarui',
          message: `Data "${payload.nama}" berhasil disimpan.`,
        });
      } else {
        await api.createAnggota(payload, getToken());
        showToast({
          type: 'success',
          title: 'Anggota ditambahkan',
          message: `"${payload.nama}" berhasil didaftarkan.`,
        });
      }
      setFormOpen(false);
      await loadMembers();
    } catch (err) {
      if (Array.isArray(err.errors)) {
        const mapped = {};
        err.errors.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setFormErrors(mapped);
      }
      showToast({
        type: 'error',
        title: 'Gagal menyimpan anggota',
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
      await api.deleteAnggota(deleteTarget.id, getToken());
      showToast({
        type: 'success',
        title: 'Anggota dihapus',
        message: `"${deleteTarget.nama}" berhasil dihapus.`,
      });
      setDeleteTarget(null);
      await loadMembers();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal menghapus anggota',
        message: err.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (r) => <span className="font-mono text-xs font-semibold text-navy">{r.id}</span>,
    },
    {
      key: 'nim',
      label: 'NIM / NIP',
      render: (r) => <span className="font-mono text-xs">{r.nim}</span>,
    },
    {
      key: 'nama',
      label: 'Nama',
      render: (r) => <span className="font-medium text-navy">{r.nama}</span>,
    },
    { key: 'email', label: 'Email' },
    { key: 'jurusan', label: 'Jurusan', render: (r) => r.jurusan || '—' },
    {
      key: 'noTelepon',
      label: 'No. Telepon',
      render: (r) => <span className="font-mono text-xs">{r.noTelepon || '—'}</span>,
    },
    {
      key: 'statusAktif',
      label: 'Status',
      render: (r) => <StatusBadge status={r.statusAktif ? 'AKTIF' : 'NONAKTIF'} />,
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button variant="neutral" size="sm" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(r)}>
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
            Manajemen Data Anggota (CRUD)
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Kelola data mahasiswa/dosen pemustaka dan status keaktifan peminjaman.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <UserPlus className="h-4 w-4" />
          + Tambah Anggota
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari nama, NIM/NIP, atau email..."
          />
          <div className="w-full sm:w-48">
            <Select
              value={aktifFilter}
              onChange={(e) => setAktifFilter(e.target.value)}
              aria-label="Filter status keaktifan"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </Select>
          </div>
          <Button variant="neutral" onClick={loadMembers}>
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          rows={members}
          loading={loading}
          emptyTitle="Anggota tidak ditemukan"
          emptyDescription="Coba ubah filter atau daftarkan anggota baru."
        />
      </Card>

      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        loading={saving}
        title={editing ? `Ubah Anggota (${editing.id})` : 'Tambah Anggota Baru'}
        submitLabel="Simpan Anggota"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="NIM / NIP" required error={formErrors.nim} htmlFor="mb-nim">
            <Input
              id="mb-nim"
              value={form.nim}
              onChange={(e) => setForm({ ...form, nim: e.target.value })}
              placeholder="1301210006"
              error={formErrors.nim}
            />
          </FormField>

          <FormField label="Nama Lengkap" required error={formErrors.nama} htmlFor="mb-nama">
            <Input
              id="mb-nama"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              placeholder="Eka Putri"
              error={formErrors.nama}
            />
          </FormField>

          <FormField label="Email Kampus" required error={formErrors.email} htmlFor="mb-email">
            <Input
              id="mb-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="eka@student.telkomuniversity.ac.id"
              error={formErrors.email}
            />
          </FormField>

          <FormField label="Jurusan" error={formErrors.jurusan} htmlFor="mb-jurusan">
            <Input
              id="mb-jurusan"
              value={form.jurusan}
              onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
              placeholder="Informatika"
            />
          </FormField>

          <FormField label="No. Telepon" error={formErrors.noTelepon} htmlFor="mb-telp">
            <Input
              id="mb-telp"
              value={form.noTelepon}
              onChange={(e) => setForm({ ...form, noTelepon: e.target.value })}
              placeholder="081200000000"
              error={formErrors.noTelepon}
            />
          </FormField>

          <div className="flex items-end pb-2">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-navy">
              <input
                type="checkbox"
                checked={form.statusAktif}
                onChange={(e) => setForm({ ...form, statusAktif: e.target.checked })}
                className="h-4 w-4 rounded border-ink-line text-brand focus:ring-brand"
              />
              <span>Status Keanggotaan Aktif</span>
            </label>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Data Anggota"
        confirmLabel="Hapus Anggota"
        message={
          deleteTarget
            ? `Yakin menghapus anggota "${deleteTarget.nama}" (${deleteTarget.nim})? Penghapusan ditolak jika masih memiliki peminjaman aktif.`
            : ''
        }
      />
    </div>
  );
}
