import { checkoutBuku, getRingkasan, kembalikanBuku } from '../services/sirkulasi.service.js';
import { ok } from '../utils/response.js';

export const pinjam = (req, res) => {
  const { peminjaman, buku } = checkoutBuku(req.body, req.user);
  return ok(res, peminjaman, 'Peminjaman berhasil', 201, { buku });
};

export const kembali = (req, res) => {
  const { data, buku } = kembalikanBuku(req.body);
  return ok(res, data, 'Buku dikembalikan', 200, { buku });
};

export const ringkasan = (_req, res) => {
  const data = getRingkasan();
  return ok(res, data);
};
