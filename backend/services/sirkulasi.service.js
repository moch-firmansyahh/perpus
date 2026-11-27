import { store } from '../data/store.js';
import { addDaysISO, computeLateStats, DEFAULT_DURASI_HARI } from '../utils/dates.js';
import { nextId, nextKodePeminjaman } from '../utils/ids.js';
import { AppError } from '../utils/response.js';
import { parseOptionalInt, trimStr } from '../utils/validators.js';
import { resolveLoanSnapshot } from './peminjaman.service.js';

export const checkoutBuku = (payload, user) => {
  let anggotaId = trimStr(payload.anggotaId);
  const bukuId = trimStr(payload.bukuId);
  const durasiHari = parseOptionalInt(payload.durasiHari) ?? DEFAULT_DURASI_HARI;

  if (user?.role === 'MAHASISWA') {
    if (!user.anggotaId) {
      throw new AppError(403, 'Akun mahasiswa belum tertaut dengan data anggota');
    }
    if (anggotaId && anggotaId !== user.anggotaId) {
      throw new AppError(403, 'Mahasiswa hanya dapat melakukan peminjaman untuk dirinya sendiri');
    }
    anggotaId = user.anggotaId;
  }

  if (!anggotaId || !bukuId) {
    throw new AppError(422, 'anggotaId dan bukuId wajib dipilih');
  }

  if (Number.isNaN(durasiHari) || durasiHari < 1 || durasiHari > 30) {
    throw new AppError(422, 'Durasi peminjaman harus antara 1 hingga 30 hari', [
      { field: 'durasiHari', message: 'Nilai valid 1-30 hari' },
    ]);
  }

  // 1. Cari anggota -> 404 bila tidak ada
  const anggota = store.anggota.find((a) => a.id === anggotaId);
  if (!anggota) {
    throw new AppError(404, 'Anggota tidak ditemukan');
  }

  // 2. Anggota harus aktif -> 422 bila false
  if (!anggota.statusAktif) {
    throw new AppError(422, 'Anggota tidak aktif', [
      { field: 'anggotaId', message: 'statusAktif = false' },
    ]);
  }

  // 3. Cari buku -> 404 bila tidak ada
  const buku = store.buku.find((b) => b.id === bukuId);
  if (!buku) {
    throw new AppError(404, 'Buku tidak ditemukan');
  }

  // 4. Stok tersedia > 0 -> 422 bila 0
  if (buku.tersedia <= 0) {
    throw new AppError(422, 'Stok buku habis', [
      { field: 'bukuId', message: 'tersedia = 0' },
    ]);
  }

  // Cegah peminjaman ganda judul yang sama selagi masih aktif
  const alreadyBorrowing = store.peminjaman.some(
    (p) => p.anggotaId === anggotaId && p.bukuId === bukuId && p.status !== 'DIKEMBALIKAN'
  );
  if (alreadyBorrowing) {
    throw new AppError(422, 'Anggota masih memiliki peminjaman aktif untuk buku ini');
  }

  // 5-6. Eksekusi sinkron (atomik di single-process Node.js)
  const now = new Date();
  buku.tersedia -= 1;

  const newLoan = {
    id: nextId('LN', store.peminjaman),
    kodePeminjaman: nextKodePeminjaman(store.peminjaman, now),
    anggotaId: anggota.id,
    bukuId: buku.id,
    tanggalPinjam: now.toISOString(),
    batasKembali: addDaysISO(now, durasiHari),
    tanggalKembali: null,
    status: 'DIPINJAM',
    denda: 0,
  };

  store.peminjaman.push(newLoan);

  return {
    peminjaman: resolveLoanSnapshot(newLoan, now.toISOString()),
    buku: { id: buku.id, tersedia: buku.tersedia },
  };
};

export const kembalikanBuku = (payload) => {
  const peminjamanId = trimStr(payload.peminjamanId);
  if (!peminjamanId) {
    throw new AppError(422, 'peminjamanId wajib diisi');
  }

  const loan = store.peminjaman.find((p) => p.id === peminjamanId);
  if (!loan) {
    throw new AppError(404, 'Data peminjaman tidak ditemukan');
  }
  if (loan.status === 'DIKEMBALIKAN') {
    throw new AppError(422, 'Buku sudah dikembalikan sebelumnya');
  }

  const nowISO = new Date().toISOString();
  const { hariTerlambat, denda } = computeLateStats(loan.batasKembali, nowISO);

  loan.tanggalKembali = nowISO;
  loan.status = 'DIKEMBALIKAN';
  loan.denda = denda;

  const buku = store.buku.find((b) => b.id === loan.bukuId);
  if (buku) {
    buku.tersedia = Math.min(buku.stok, buku.tersedia + 1);
  }

  return {
    data: {
      ...resolveLoanSnapshot(loan, nowISO),
      hariTerlambat,
    },
    buku: buku ? { id: buku.id, tersedia: buku.tersedia } : null,
  };
};

export const getRingkasan = () => {
  const nowISO = new Date().toISOString();
  const snapshots = store.peminjaman.map((p) => resolveLoanSnapshot(p, nowISO));
  const peminjamanBerjalan = snapshots.filter((p) => p.status !== 'DIKEMBALIKAN');

  return {
    totalJudul: store.buku.length,
    totalEksemplar: store.buku.reduce((acc, b) => acc + b.stok, 0),
    eksemplarTersedia: store.buku.reduce((acc, b) => acc + b.tersedia, 0),
    anggotaTerdaftar: store.anggota.length,
    anggotaAktif: store.anggota.filter((a) => a.statusAktif).length,
    peminjamanAktif: peminjamanBerjalan.length,
    peminjamanTerlambat: peminjamanBerjalan.filter((p) => p.status === 'TERLAMBAT').length,
    peminjamanBerjalan,
  };
};
