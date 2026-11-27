import { store } from '../data/store.js';
import { nextId } from '../utils/ids.js';
import { AppError } from '../utils/response.js';
import { ISBN_REGEX, parseOptionalInt, trimStr } from '../utils/validators.js';

const countActiveLoansForBook = (bukuId) =>
  store.peminjaman.filter((p) => p.bukuId === bukuId && p.status !== 'DIKEMBALIKAN').length;

const validateBookPayload = (payload, isCreate) => {
  const errors = [];
  const currentYear = new Date().getUTCFullYear();

  const judul = payload.judul !== undefined ? trimStr(payload.judul) : undefined;
  const pengarang = payload.pengarang !== undefined ? trimStr(payload.pengarang) : undefined;
  const penerbit = payload.penerbit !== undefined ? trimStr(payload.penerbit) : undefined;
  const kategori = payload.kategori !== undefined ? trimStr(payload.kategori) : undefined;
  const isbn = payload.isbn !== undefined ? trimStr(payload.isbn) : undefined;
  const tahunTerbit = parseOptionalInt(payload.tahunTerbit);
  const stok = parseOptionalInt(payload.stok);

  if ((isCreate || judul !== undefined) && (!judul || judul.length > 200)) {
    errors.push({ field: 'judul', message: 'Judul wajib diisi (1-200 karakter)' });
  }
  if ((isCreate || pengarang !== undefined) && (!pengarang || pengarang.length > 120)) {
    errors.push({ field: 'pengarang', message: 'Pengarang wajib diisi (1-120 karakter)' });
  }
  if (penerbit !== undefined && penerbit.length > 120) {
    errors.push({ field: 'penerbit', message: 'Penerbit maksimal 120 karakter' });
  }
  if (isbn !== undefined && isbn !== '' && !ISBN_REGEX.test(isbn)) {
    errors.push({ field: 'isbn', message: 'ISBN harus 10-17 karakter angka atau tanda hubung' });
  }
  if (tahunTerbit !== undefined && (Number.isNaN(tahunTerbit) || tahunTerbit < 1900 || tahunTerbit > currentYear)) {
    errors.push({
      field: 'tahunTerbit',
      message: `Tahun terbit harus antara 1900 hingga ${currentYear}`,
    });
  }
  if (isCreate && (stok === undefined || Number.isNaN(stok) || stok < 0)) {
    errors.push({ field: 'stok', message: 'Stok wajib berupa bilangan bulat >= 0' });
  } else if (!isCreate && stok !== undefined && (Number.isNaN(stok) || stok < 0)) {
    errors.push({ field: 'stok', message: 'Stok harus berupa bilangan bulat >= 0' });
  }

  if (errors.length > 0) {
    throw new AppError(422, errors[0].message, errors);
  }

  return { judul, pengarang, penerbit, kategori, isbn, tahunTerbit, stok };
};

export const listBuku = ({ search = '', kategori = '' } = {}) => {
  const q = trimStr(search).toLowerCase();
  const cat = trimStr(kategori).toLowerCase();

  return store.buku.filter((item) => {
    const matchCategory = !cat || (item.kategori || '').toLowerCase() === cat;
    if (!matchCategory) return false;
    if (!q) return true;
    return [item.judul, item.pengarang, item.isbn, item.kategori, item.id]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));
  });
};

export const getBukuById = (id) => {
  const buku = store.buku.find((b) => b.id === id);
  if (!buku) {
    throw new AppError(404, 'Buku tidak ditemukan');
  }
  return buku;
};

export const createBuku = (payload) => {
  const clean = validateBookPayload(payload, true);
  const newBook = {
    id: nextId('BK', store.buku),
    isbn: clean.isbn || '',
    judul: clean.judul,
    pengarang: clean.pengarang,
    penerbit: clean.penerbit || '',
    tahunTerbit: clean.tahunTerbit ?? new Date().getUTCFullYear(),
    kategori: clean.kategori || '',
    stok: clean.stok,
    tersedia: clean.stok,
  };
  store.buku.push(newBook);
  return newBook;
};

export const updateBuku = (id, payload) => {
  const buku = getBukuById(id);
  const clean = validateBookPayload(payload, false);

  if (clean.stok !== undefined) {
    const activeCount = countActiveLoansForBook(id);
    if (clean.stok < activeCount) {
      throw new AppError(
        422,
        `Stok tidak boleh kurang dari jumlah peminjaman aktif (${activeCount})`,
        [{ field: 'stok', message: `Minimal ${activeCount}` }]
      );
    }
    buku.stok = clean.stok;
    buku.tersedia = clean.stok - activeCount;
  }

  if (clean.judul !== undefined) buku.judul = clean.judul;
  if (clean.pengarang !== undefined) buku.pengarang = clean.pengarang;
  if (clean.penerbit !== undefined) buku.penerbit = clean.penerbit;
  if (clean.kategori !== undefined) buku.kategori = clean.kategori;
  if (clean.isbn !== undefined) buku.isbn = clean.isbn;
  if (clean.tahunTerbit !== undefined) buku.tahunTerbit = clean.tahunTerbit;

  return buku;
};

export const deleteBuku = (id) => {
  const index = store.buku.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new AppError(404, 'Buku tidak ditemukan');
  }
  const activeCount = countActiveLoansForBook(id);
  if (activeCount > 0) {
    throw new AppError(409, 'Buku tidak dapat dihapus karena masih memiliki peminjaman aktif');
  }
  const [removed] = store.buku.splice(index, 1);
  return removed;
};
