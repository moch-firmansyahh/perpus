import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { store } from '../data/store.js';
import { getJwtSecret } from '../middleware/auth.js';
import { nextId } from '../utils/ids.js';
import { AppError } from '../utils/response.js';
import { EMAIL_REGEX, PHONE_REGEX, trimStr } from '../utils/validators.js';

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role,
  anggotaId: user.anggotaId ?? null,
});

export const registerMahasiswa = (payload) => {
  const nama = trimStr(payload.nama);
  const nim = trimStr(payload.nim);
  const email = trimStr(payload.email).toLowerCase();
  const jurusan = trimStr(payload.jurusan);
  const noTelepon = trimStr(payload.noTelepon);
  const password = typeof payload.password === 'string' ? payload.password : '';
  const konfirmasiPassword =
    typeof payload.konfirmasiPassword === 'string' ? payload.konfirmasiPassword : '';

  const errors = [];
  if (!nama || nama.length > 120) {
    errors.push({ field: 'nama', message: 'Nama wajib diisi (1-120 karakter)' });
  }
  if (!nim) {
    errors.push({ field: 'nim', message: 'NIM/NIP wajib diisi' });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Format email tidak valid' });
  }
  if (noTelepon && !PHONE_REGEX.test(noTelepon)) {
    errors.push({ field: 'noTelepon', message: 'Format nomor telepon harus 08xxxxxxxxxx (9-14 digit)' });
  }
  if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password minimal 8 karakter' });
  }
  if (password !== konfirmasiPassword) {
    errors.push({ field: 'konfirmasiPassword', message: 'Konfirmasi password tidak cocok' });
  }
  if (errors.length > 0) {
    throw new AppError(422, errors[0].message, errors);
  }

  const nimExists = store.anggota.some((a) => a.nim.toLowerCase() === nim.toLowerCase());
  const emailExists = store.anggota.some((a) => a.email.toLowerCase() === email);
  const usernameExists = store.users.some((u) => u.username.toLowerCase() === nim.toLowerCase());
  if (nimExists || emailExists || usernameExists) {
    throw new AppError(409, 'NIM atau email sudah terdaftar');
  }

  const anggota = {
    id: nextId('MB', store.anggota),
    nim,
    nama,
    email,
    jurusan,
    noTelepon,
    statusAktif: true,
  };

  const user = {
    id: nextId('US', store.users),
    username: nim,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'MAHASISWA',
    anggotaId: anggota.id,
  };

  store.anggota.push(anggota);
  store.users.push(user);

  return {
    user: sanitizeUser(user),
    anggota,
  };
};

export const loginUser = (payload) => {
  const identifier = trimStr(payload.username);
  const password = typeof payload.password === 'string' ? payload.password : '';

  if (!identifier || !password) {
    throw new AppError(422, 'Username dan password wajib diisi');
  }

  const lower = identifier.toLowerCase();
  let user = store.users.find((u) => u.username.toLowerCase() === lower);

  if (!user) {
    const matchedAnggota = store.anggota.find((a) => a.email.toLowerCase() === lower);
    if (matchedAnggota) {
      user = store.users.find((u) => u.anggotaId === matchedAnggota.id);
    }
  }

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new AppError(401, 'Username atau password salah');
  }

  const token = jwt.sign(sanitizeUser(user), getJwtSecret(), { expiresIn: '2h' });
  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getCurrentProfile = (userId) => {
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    throw new AppError(404, 'Pengguna tidak ditemukan');
  }
  const anggota = user.anggotaId
    ? store.anggota.find((a) => a.id === user.anggotaId) ?? null
    : null;

  return {
    user: sanitizeUser(user),
    anggota,
  };
};
