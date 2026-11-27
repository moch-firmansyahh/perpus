import {
  createPeminjamanManual,
  deletePeminjaman,
  getPeminjamanById,
  listPeminjaman,
  updatePeminjaman,
} from '../services/peminjaman.service.js';
import { ok } from '../utils/response.js';

export const getAllPeminjaman = (req, res) => {
  const data = listPeminjaman(
    {
      status: req.query.status,
      anggotaId: req.query.anggotaId,
      bukuId: req.query.bukuId,
      search: req.query.search,
    },
    req.user
  );
  return ok(res, data, 'OK', 200, { meta: { total: data.length } });
};

export const getOnePeminjaman = (req, res) => {
  const data = getPeminjamanById(req.params.id, req.user);
  return ok(res, data);
};

export const postPeminjaman = (req, res) => {
  const data = createPeminjamanManual(req.body);
  return ok(res, data, 'Peminjaman dicatat', 201);
};

export const putPeminjaman = (req, res) => {
  const data = updatePeminjaman(req.params.id, req.body);
  return ok(res, data, 'Peminjaman diperbarui');
};

export const removePeminjaman = (req, res) => {
  const data = deletePeminjaman(req.params.id);
  return ok(res, data, 'Peminjaman dihapus');
};
