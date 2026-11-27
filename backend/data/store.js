import bcrypt from 'bcryptjs';
import { addDaysISO } from '../utils/dates.js';

const formatYM = (isoDate) => {
  const d = new Date(isoDate);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${yyyy}${mm}`;
};

const createSeedData = () => {
  const now = new Date();

  const buku = [
    {
      id: 'BK-001',
      isbn: '978-013-354-462-6',
      judul: 'Cloud Computing: Architecture and Patterns',
      pengarang: 'Thomas Erl',
      penerbit: 'Prentice Hall',
      tahunTerbit: 2021,
      kategori: 'Komputasi Awan',
      stok: 5,
      tersedia: 5,
    },
    {
      id: 'BK-002',
      isbn: '978-149-197-534-3',
      judul: 'Desain Sistem Terdistribusi Modern',
      pengarang: 'Brendan Burns',
      penerbit: "O'Reilly Media",
      tahunTerbit: 2022,
      kategori: 'Sistem Terdistribusi',
      stok: 4,
      tersedia: 4,
    },
    {
      id: 'BK-003',
      isbn: '978-013-449-416-6',
      judul: "Clean Architecture: A Craftsman's Guide",
      pengarang: 'Robert C. Martin',
      penerbit: 'Pearson',
      tahunTerbit: 2020,
      kategori: 'Rekayasa PL',
      stok: 6,
      tersedia: 6,
    },
    {
      id: 'BK-004',
      isbn: '978-149-192-912-4',
      judul: 'Site Reliability Engineering (SRE)',
      pengarang: 'Niall Murphy',
      penerbit: "O'Reilly Media",
      tahunTerbit: 2023,
      kategori: 'DevOps & Cloud',
      stok: 3,
      tersedia: 3,
    },
    {
      id: 'BK-005',
      isbn: '978-602-623-294-6',
      judul: 'Algoritma Pemrograman & Struktur Data',
      pengarang: 'Rinaldi Munir',
      penerbit: 'Informatika',
      tahunTerbit: 2021,
      kategori: 'Ilmu Komputer',
      stok: 7,
      tersedia: 7,
    },
  ];

  const anggota = [
    {
      id: 'MB-001',
      nim: '1301210001',
      nama: 'Muhammad Firman',
      email: 'firman@student.telkomuniversity.ac.id',
      jurusan: 'Informatika',
      noTelepon: '081234567801',
      statusAktif: true,
    },
    {
      id: 'MB-002',
      nim: '1301210002',
      nama: 'Alya Zahra Salsabila',
      email: 'alya@student.telkomuniversity.ac.id',
      jurusan: 'Sistem Informasi',
      noTelepon: '081234567802',
      statusAktif: true,
    },
    {
      id: 'MB-003',
      nim: '1301210003',
      nama: 'Budi Santoso',
      email: 'budi@student.telkomuniversity.ac.id',
      jurusan: 'Informatika',
      noTelepon: '081234567803',
      statusAktif: true,
    },
    {
      id: 'MB-004',
      nim: '1301210004',
      nama: 'Citra Lestari',
      email: 'citra@student.telkomuniversity.ac.id',
      jurusan: 'Teknologi Informasi',
      noTelepon: '081234567804',
      statusAktif: true,
    },
    {
      id: 'MB-005',
      nim: '1301210005',
      nama: 'Dimas Pratama',
      email: 'dimas@student.telkomuniversity.ac.id',
      jurusan: 'Informatika',
      noTelepon: '081234567805',
      statusAktif: false,
    },
  ];

  const ln1Pinjam = addDaysISO(now, -2);
  const ln2Pinjam = addDaysISO(now, -1);
  const ln3Pinjam = addDaysISO(now, -14);
  const ln4Pinjam = addDaysISO(now, -30);

  const peminjaman = [
    {
      id: 'LN-001',
      kodePeminjaman: `PINJAM-${formatYM(ln1Pinjam)}-001`,
      anggotaId: 'MB-001',
      bukuId: 'BK-001',
      tanggalPinjam: ln1Pinjam,
      batasKembali: addDaysISO(now, 5),
      tanggalKembali: null,
      status: 'DIPINJAM',
      denda: 0,
    },
    {
      id: 'LN-002',
      kodePeminjaman: `PINJAM-${formatYM(ln2Pinjam)}-002`,
      anggotaId: 'MB-002',
      bukuId: 'BK-002',
      tanggalPinjam: ln2Pinjam,
      batasKembali: addDaysISO(now, 6),
      tanggalKembali: null,
      status: 'DIPINJAM',
      denda: 0,
    },
    {
      id: 'LN-003',
      kodePeminjaman: `PINJAM-${formatYM(ln3Pinjam)}-003`,
      anggotaId: 'MB-003',
      bukuId: 'BK-004',
      tanggalPinjam: ln3Pinjam,
      batasKembali: addDaysISO(now, -7),
      tanggalKembali: null,
      status: 'DIPINJAM',
      denda: 0,
    },
    {
      id: 'LN-004',
      kodePeminjaman: `PINJAM-${formatYM(ln4Pinjam)}-004`,
      anggotaId: 'MB-004',
      bukuId: 'BK-003',
      tanggalPinjam: ln4Pinjam,
      batasKembali: addDaysISO(now, -23),
      tanggalKembali: addDaysISO(now, -25),
      status: 'DIKEMBALIKAN',
      denda: 0,
    },
  ];

  // Hitung ulang tersedia agar konsisten dengan peminjaman aktif pada seed
  for (const item of buku) {
    const activeCount = peminjaman.filter(
      (p) => p.bukuId === item.id && p.status !== 'DIKEMBALIKAN'
    ).length;
    item.tersedia = Math.max(0, item.stok - activeCount);
  }

  const users = [
    {
      id: 'US-001',
      username: 'admin',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'PUSTAKAWAN',
      anggotaId: null,
    },
    {
      id: 'US-002',
      username: '1301210001',
      passwordHash: bcrypt.hashSync('mahasiswa123', 10),
      role: 'MAHASISWA',
      anggotaId: 'MB-001',
    },
  ];

  return { buku, anggota, peminjaman, users };
};

export const store = createSeedData();

export const resetStore = () => {
  const fresh = createSeedData();
  store.buku = fresh.buku;
  store.anggota = fresh.anggota;
  store.peminjaman = fresh.peminjaman;
  store.users = fresh.users;
};
