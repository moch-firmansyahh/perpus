import { store } from '../data/store.js';
import { addDaysISO, computeLateStats, DEFAULT_DURASI_HARI } from '../utils/dates.js';
import { nextId, nextKodePeminjaman } from '../utils/ids.js';
import { AppError } from '../utils/response.js';
import { parseOptionalInt, trimStr } from '../utils/validators.js';

export const resolveLoanSnapshot = (loan, nowISO = new Date().toISOString()) => {
  const anggota = store.anggota.find((a) => a.id === loan.anggotaId) ?? null;
  const buku = store.buku.find((b) => b.id === loan.bukuId) ?? null;

  let status = loan.status;
  let denda = loan.denda ?? 0;

  if (status !== 'DIKEMBALIKAN') {
    const late = computeLateStats(loan.batasKembali, nowISO);
    if (late.hariTerlambat > 0) {
      status = 'TERLAMBAT';
      denda = late.denda;
    } else {
      status = 'DIPINJAM';
      denda = 0;
    }
  }

  return {
    ...loan,
    status,
    denda,
    anggotaNama: anggota ? anggota.nama : '(data dihapus)',
    bukuJudul: buku ? buku.judul : '(data dihapus)',
  };
};

const syncBookAvailability = (bukuId) => {
  const buku = store.buku.find((b) => b.id === bukuId);
  if (!buku) return;
  const activeCount = store.peminjaman.filter(
    (p) => p.bukuId === bukuId && p.status !== 'DIKEMBALIKAN'
  ).length;
  buku.tersedia = Math.max(0, buku.stok - activeCount);
};

export const listPeminjaman = ({ status = '', anggotaId = '', bukuId = '', search = '' } = {}, user) => {
  const nowISO = new Date().toISOString();
  const q = trimStr(search).toLowerCase();
  const statusFilter = trimStr(status).toUpperCase();

  const items = store.peminjaman
    .map((loan) => resolveLoanSnapshot(loan, nowISO))
    .filter((loan) => {
      if (user?.role === 'MAHASISWA' && loan.anggotaId !== user.anggotaId) {
        return false;
      }
      if (statusFilter && loan.status !== statusFilter) return false;
      if (anggotaId && loan.anggotaId !== anggotaId) return false;
      if (bukuId && loan.bukuId !== bukuId) return false;
      if (!q) return true;
      return [loan.kodePeminjaman, loan.anggotaNama, loan.bukuJudul, loan.id]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q));
    });

  return items;
};

export const getPeminjamanById = (id, user) => {
  const raw = store.peminjaman.find((p) => p.id === id);
  if (!raw) {
    throw new AppError(404, 'Data peminjaman tidak ditemukan');
  }
  if (user?.role === 'MAHASISWA' && raw.anggotaId !== user.anggotaId) {
    throw new AppError(403, 'Anda tidak memiliki izin mengakses peminjaman ini');
  }

  const snapshot = resolveLoanSnapshot(raw);
  const anggota = store.anggota.find((a) => a.id === raw.anggotaId) ?? null;
  const buku = store.buku.find((b) => b.id === raw.bukuId) ?? null;

  return {
    ...snapshot,
    anggota,
    buku,
  };
};

export const createPeminjamanManual = (payload) => {
  const anggotaId = trimStr(payload.anggotaId);
  const bukuId = trimStr(payload.bukuId);
  const durasiHari = parseOptionalInt(payload.durasiHari) ?? DEFAULT_DURASI_HARI;

  if (!anggotaId || !bukuId) {
    throw new AppError(422, 'anggotaId dan bukuId wajib diisi');
  }
  if (!store.anggota.some((a) => a.id === anggotaId)) {
    throw new AppError(404, 'Anggota tidak ditemukan');
  }
  if (!store.buku.some((b) => b.id === bukuId)) {
    throw new AppError(404, 'Buku tidak ditemukan');
  }
  if (Number.isNaN(durasiHari) || durasiHari < 1 || durasiHari > 30) {
    throw new AppError(422, 'durasiHari harus antara 1 hingga 30');
  }

  const now = new Date();
  let batasKembali = addDaysISO(now, durasiHari);
  if (payload.batasKembali !== undefined && payload.batasKembali !== '') {
    const parsed = new Date(payload.batasKembali);
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError(422, 'Format batasKembali tidak valid');
    }
    batasKembali = parsed.toISOString();
  }

  const allowedStatus = ['DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT'];
  const status = payload.status && allowedStatus.includes(payload.status) ? payload.status : 'DIPINJAM';

  const newLoan = {
    id: nextId('LN', store.peminjaman),
    kodePeminjaman: nextKodePeminjaman(store.peminjaman, now),
    anggotaId,
    bukuId,
    tanggalPinjam: now.toISOString(),
    batasKembali,
    tanggalKembali: status === 'DIKEMBALIKAN' ? now.toISOString() : null,
    status,
    denda: Math.max(0, Number(payload.denda) || 0),
  };

  store.peminjaman.push(newLoan);
  return resolveLoanSnapshot(newLoan);
};

export const updatePeminjaman = (id, payload) => {
  const loan = store.peminjaman.find((p) => p.id === id);
  if (!loan) {
    throw new AppError(404, 'Data peminjaman tidak ditemukan');
  }

  const allowedStatus = ['DIPINJAM', 'DIKEMBALIKAN', 'TERLAMBAT'];
  if (payload.status !== undefined) {
    if (!allowedStatus.includes(payload.status)) {
      throw new AppError(422, 'Status peminjaman tidak valid');
    }
    loan.status = payload.status;
    if (payload.status === 'DIKEMBALIKAN' && !loan.tanggalKembali) {
      loan.tanggalKembali = new Date().toISOString();
    } else if (payload.status !== 'DIKEMBALIKAN') {
      loan.tanggalKembali = null;
    }
    syncBookAvailability(loan.bukuId);
  }

  if (payload.batasKembali !== undefined) {
    const parsed = new Date(payload.batasKembali);
    if (Number.isNaN(parsed.getTime())) {
      throw new AppError(422, 'Format batasKembali tidak valid');
    }
    loan.batasKembali = parsed.toISOString();
  }

  if (payload.denda !== undefined) {
    const denda = Number(payload.denda);
    if (Number.isNaN(denda) || denda < 0) {
      throw new AppError(422, 'Denda harus berupa angka >= 0');
    }
    loan.denda = denda;
  }

  return resolveLoanSnapshot(loan);
};

export const deletePeminjaman = (id) => {
  const index = store.peminjaman.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new AppError(404, 'Data peminjaman tidak ditemukan');
  }
  const [removed] = store.peminjaman.splice(index, 1);
  if (removed.status !== 'DIKEMBALIKAN') {
    const buku = store.buku.find((b) => b.id === removed.bukuId);
    if (buku) {
      buku.tersedia = Math.min(buku.stok, buku.tersedia + 1);
    }
  }
  return removed;
};
