'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookPlus, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DataTable } from '@/components/DataTable';
import { FormDialog } from '@/components/FormDialog';
import { SearchBar } from '@/components/SearchBar';
import { useToast } from '@/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField, Input, Select } from '@/components/ui/input';
import { api } from '@/lib/api';
import { getStoredUser, getToken } from '@/lib/auth';

const EMPTY_BOOK_FORM = {
  judul: '',
  pengarang: '',
  penerbit: '',
  kategori: '',
  tahunTerbit: String(new Date().getFullYear()),
  stok: '1',
  isbn: '',
};

export default function BukuPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kategori, setKategori] = useState('');

  // Modal Create/Edit
  const [formOpen, setFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [form, setForm] = useState(EMPTY_BOOK_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal Delete / Borrow
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [borrowTarget, setBorrowTarget] = useState(null);
  const [borrowing, setBorrowing] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const isPustakawan = user?.role === 'PUSTAKAWAN';

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listBuku({ search, kategori }, getToken());
      setBooks(res.data || []);
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gagal memuat katalog',
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [search, kategori, showToast]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const categories = useMemo(() => {
    const set = new Set(books.map((b) => b.kategori).filter(Boolean));
    return Array.from(set).sort();
  }, [books]);

  const openCreateModal = () => {
    setEditingBook(null);
    setForm(EMPTY_BOOK_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setForm({
      judul: book.judul || '',
      pengarang: book.pengarang || '',
      penerbit: book.penerbit || '',
      kategori: book.kategori || '',
      tahunTerbit: book.tahunTerbit ? String(book.tahunTerbit) : '',
      stok: String(book.stok ?? 0),
      isbn: book.isbn || '',
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSave = async () => {
    const nextErr = {};
    if (!form.judul.trim()) nextErr.judul = 'Judul wajib diisi';
    if (!form.pengarang.trim()) nextErr.pengarang = 'Pengarang wajib diisi';
    if (form.stok === '' || Number(form.stok) < 0 || !Number.isInteger(Number(form.stok))) {
      nextErr.stok = 'Stok wajib bilangan bulat >= 0';
    }
    setFormErrors(nextErr);
    if (Object.keys(nextErr).length > 0) return;

    const payload = {
      judul: form.judul.trim(),
      pengarang: form.pengarang.trim(),
      penerbit: form.penerbit.trim(),
      kategori: form.kategori.trim(),
      tahunTerbit: form.tahunTerbit ? Number(form.tahunTerbit) : undefined,
      stok: Number(form.stok),
      isbn: form.isbn.trim(),
    };

    setSaving(true);
    try {
      if (editingBook) {
        await api.updateBuku(editingBook.id, payload, getToken());
        showToast({
          type: 'success',
          title: 'Buku diperbarui',
          message: `"${payload.judul}" berhasil disimpan.`,
        });
      } else {
        await api.createBuku(payload, getToken());
        showToast({
          type: 'success',
          title: 'Buku ditambahkan',
          message: `"${payload.judul}" masuk ke katalog.`,
        });
      }
      setFormOpen(false);
      await loadBooks();
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
        title: 'Gagal menyimpan buku',
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
      await api.deleteBuku(deleteTarget.id, getToken());
      showToast({
        type: 'success',
        title: 'Buku dihapus',
        message: `"${deleteTarget.judul}" telah dihapus dari katalog.`,
      });
      setDeleteTarget(null);
      await loadBooks();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Tidak dapat menghapus buku',
        message: err.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleStudentBorrow = async () => {
    if (!borrowTarget) return;
    setBorrowing(true);
    try {
      await api.pinjam(
        {
          anggotaId: user?.anggotaId,
          bukuId: borrowTarget.id,
          durasiHari: 7,
        },
        getToken()
      );
      showToast({
        type: 'success',
        title: 'Peminjaman berhasil',
        message: `Anda meminjam "${borrowTarget.judul}" selama 7 hari.`,
      });
      setBorrowTarget(null);
      await loadBooks();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Peminjaman ditolak',
        message: err.message,
      });
    } finally {
      setBorrowing(false);
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'ID & ISBN',
      render: (r) => (
        <div>
          <p className="font-mono text-xs font-semibold text-navy">{r.id}</p>
          <p className="font-mono text-[11px] text-ink-muted">{r.isbn || '—'}</p>
        </div>
      ),
    },
    {
      key: 'judul',
      label: 'Judul',
      render: (r) => <p className="font-medium text-navy">{r.judul}</p>,
    },
    {
      key: 'pengarang',
      label: 'Pengarang & Penerbit',
      render: (r) => (
        <div>
          <p className="text-sm text-ink">{r.pengarang}</p>
          <p className="text-xs text-ink-muted">{r.penerbit || '—'}</p>
        </div>
      ),
    },
    {
      key: 'kategori',
      label: 'Kategori & Tahun',
      render: (r) => (
        <div>
          <p className="text-sm text-ink">{r.kategori || 'Umum'}</p>
          <p className="text-xs text-ink-muted">{r.tahunTerbit || '—'}</p>
        </div>
      ),
    },
    {
      key: 'tersedia',
      label: 'Stok Tersedia',
      render: (r) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-heading text-xs font-semibold ${
            r.tersedia > 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'
          }`}
        >
          {r.tersedia}/{r.stok} Item
        </span>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (r) =>
        isPustakawan ? (
          <div className="flex items-center gap-2">
            <Button variant="neutral" size="sm" onClick={() => openEditModal(r)}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteTarget(r)}>
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            disabled={r.tersedia <= 0}
            onClick={() => setBorrowTarget(r)}
          >
            {r.tersedia > 0 ? 'Pinjam' : 'Habis'}
          </Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-navy sm:text-3xl">
            {isPustakawan ? 'Manajemen Master Koleksi Buku (CRUD)' : 'Katalog Buku Perpustakaan'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Cari judul, pengarang, ISBN, atau kategori koleksi buku kampus.
          </p>
        </div>
        {isPustakawan && (
          <Button variant="primary" onClick={openCreateModal}>
            <BookPlus className="h-4 w-4" />
            + Tambah Buku Baru
          </Button>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Cari judul, pengarang, ISBN, atau kategori..."
          />
          <div className="w-full sm:w-52">
            <Select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              aria-label="Filter kategori"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="neutral" onClick={loadBooks}>
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          rows={books}
          loading={loading}
          emptyTitle="Buku tidak ditemukan"
          emptyDescription="Coba ubah kata kunci pencarian atau tambahkan koleksi baru."
        />
      </Card>

      <FormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSave}
        loading={saving}
        title={editingBook ? `Ubah Buku (${editingBook.id})` : 'Tambah Buku Baru'}
        submitLabel="Simpan Buku"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField label="Judul Buku" required error={formErrors.judul} htmlFor="book-judul">
              <Input
                id="book-judul"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                placeholder="Microservices Patterns"
                error={formErrors.judul}
              />
            </FormField>
          </div>

          <FormField label="Pengarang" required error={formErrors.pengarang} htmlFor="book-pengarang">
            <Input
              id="book-pengarang"
              value={form.pengarang}
              onChange={(e) => setForm({ ...form, pengarang: e.target.value })}
              placeholder="Chris Richardson"
              error={formErrors.pengarang}
            />
          </FormField>

          <FormField label="Penerbit" error={formErrors.penerbit} htmlFor="book-penerbit">
            <Input
              id="book-penerbit"
              value={form.penerbit}
              onChange={(e) => setForm({ ...form, penerbit: e.target.value })}
              placeholder="Manning Publications"
            />
          </FormField>

          <FormField label="Kategori" error={formErrors.kategori} htmlFor="book-kategori">
            <Input
              id="book-kategori"
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value })}
              placeholder="Komputasi Awan"
            />
          </FormField>

          <FormField label="Tahun Terbit" error={formErrors.tahunTerbit} htmlFor="book-tahun">
            <Input
              id="book-tahun"
              type="number"
              value={form.tahunTerbit}
              onChange={(e) => setForm({ ...form, tahunTerbit: e.target.value })}
              placeholder="2024"
            />
          </FormField>

          <FormField label="Jumlah Stok" required error={formErrors.stok} htmlFor="book-stok">
            <Input
              id="book-stok"
              type="number"
              min="0"
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: e.target.value })}
              error={formErrors.stok}
            />
          </FormField>

          <FormField label="ISBN" error={formErrors.isbn} htmlFor="book-isbn">
            <Input
              id="book-isbn"
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              placeholder="978-161-729-454-9"
              error={formErrors.isbn}
            />
          </FormField>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Koleksi Buku"
        confirmLabel="Hapus Buku"
        message={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus "${deleteTarget.judul}"? Aksi ini ditolak jika buku masih dipinjam.`
            : ''
        }
      />

      <ConfirmDialog
        open={Boolean(borrowTarget)}
        onClose={() => setBorrowTarget(null)}
        onConfirm={handleStudentBorrow}
        loading={borrowing}
        variant="outline"
        title="Konfirmasi Pinjam Buku"
        confirmLabel="Pinjam Sekarang (7 Hari)"
        message={
          borrowTarget
            ? `Pinjam buku "${borrowTarget.judul}" selama 7 hari? Denda keterlambatan Rp2.000/hari.`
            : ''
        }
      />
    </div>
  );
}
