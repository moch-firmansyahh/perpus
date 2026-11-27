import { store } from '../data/store.js';
import { nextId } from '../utils/ids.js';
import { AppError } from '../utils/response.js';
import { EMAIL_REGEX, PHONE_REGEX, trimStr } from '../utils/validators.js';

const validateAnggotaPayload = (payload, isCreate) => {
  const errors = [];
  const nim = payload.nim !== undefined ? trimStr(payload.nim) : undefined;
  const nama = payload.nama !== undefined ? trimStr(payload.nama) : undefined;
  const email = payload.email !== undefined ? trimStr(payload.email).toLowerCase() : undefined;
  const jurusan = payload.jurusan !== undefined ? trimStr(payload.jurusan) : undefined;
  const noTelepon = payload.noTelepon !== undefined ? trimStr(payload.noTelepon) : undefined;
  const statusAktif =
    payload.statusAktif !== undefined ? Boolean(payload.statusAktif) : undefined;

  if ((isCreate || nim !== undefined) && !nim) {
    errors.push({ field: 'nim', message: 'NIM/NIP wajib diisi' });
  }
  if ((isCreate || nama !== undefined) && (!nama || nama.length > 120)) {
    errors.push({ field: 'nama', message: 'Nama wajib diisi (1-120 karakter)' });
  }
  if ((isCreate || email !== undefined) && (!email || !EMAIL_REGEX.test(email))) {
    errors.push({ field: 'email', message: 'Format email tidak valid' });
  }
  if (noTelepon !== undefined && noTelepon !== '' && !PHONE_REGEX.test(noTelepon)) {
    errors.push({
      field: 'noTelepon',
      message: 'Nomor telepon harus diawali 08 dan berisi 9-14 digit',
    });
  }

  if (errors.length > 0) {
    throw new AppError(422, errors[0].message, errors);
  }

  return { nim, nama, email, jurusan, noTelepon, statusAktif };
};

export const listAnggota = ({ search = '', aktif } = {}) => {
  const q = trimStr(search).toLowerCase();
  return store.anggota.filter((item) => {
    if (aktif === 'true' && !item.statusAktif) return false;
    if (aktif === 'false' && item.statusAktif) return false;
    if (!q) return true;
    return [item.nama, item.nim, item.email, item.jurusan, item.id]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));
  });
};

export const getAnggotaById = (id) => {
  const anggota = store.anggota.find((a) => a.id === id);
  if (!anggota) {
    throw new AppError(404, 'Anggota tidak ditemukan');
  }
  return anggota;
};

export const createAnggota = (payload) => {
  const clean = validateAnggotaPayload(payload, true);

  const duplicateNim = store.anggota.some((a) => a.nim.toLowerCase() === clean.nim.toLowerCase());
  const duplicateEmail = store.anggota.some((a) => a.email.toLowerCase() === clean.email);
  if (duplicateNim || duplicateEmail) {
    throw new AppError(409, 'NIM atau email anggota sudah terdaftar');
  }

  const anggota = {
    id: nextId('MB', store.anggota),
    nim: clean.nim,
    nama: clean.nama,
    email: clean.email,
    jurusan: clean.jurusan || '',
    noTelepon: clean.noTelepon || '',
    statusAktif: clean.statusAktif ?? true,
  };
  store.anggota.push(anggota);
  return anggota;
};

export const updateAnggota = (id, payload) => {
  const anggota = getAnggotaById(id);
  const clean = validateAnggotaPayload(payload, false);

  if (
    clean.nim !== undefined &&
    store.anggota.some((a) => a.id !== id && a.nim.toLowerCase() === clean.nim.toLowerCase())
  ) {
    throw new AppError(409, 'NIM sudah digunakan anggota lain');
  }
  if (
    clean.email !== undefined &&
    store.anggota.some((a) => a.id !== id && a.email.toLowerCase() === clean.email)
  ) {
    throw new AppError(409, 'Email sudah digunakan anggota lain');
  }

  if (clean.nim !== undefined) anggota.nim = clean.nim;
  if (clean.nama !== undefined) anggota.nama = clean.nama;
  if (clean.email !== undefined) anggota.email = clean.email;
  if (clean.jurusan !== undefined) anggota.jurusan = clean.jurusan;
  if (clean.noTelepon !== undefined) anggota.noTelepon = clean.noTelepon;
  if (clean.statusAktif !== undefined) anggota.statusAktif = clean.statusAktif;

  return anggota;
};

export const deleteAnggota = (id) => {
  const index = store.anggota.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new AppError(404, 'Anggota tidak ditemukan');
  }
  const hasActiveLoan = store.peminjaman.some(
    (p) => p.anggotaId === id && p.status !== 'DIKEMBALIKAN'
  );
  if (hasActiveLoan) {
    throw new AppError(409, 'Anggota tidak dapat dihapus karena masih memiliki peminjaman aktif');
  }
  const [removed] = store.anggota.splice(index, 1);
  return removed;
};
