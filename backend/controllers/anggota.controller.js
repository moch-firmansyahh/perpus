import {
  createAnggota,
  deleteAnggota,
  getAnggotaById,
  listAnggota,
  updateAnggota,
} from '../services/anggota.service.js';
import { ok } from '../utils/response.js';

export const getAllAnggota = (req, res) => {
  const data = listAnggota({
    search: req.query.search,
    aktif: req.query.aktif,
  });
  return ok(res, data, 'OK', 200, { meta: { total: data.length } });
};

export const getOneAnggota = (req, res) => {
  const data = getAnggotaById(req.params.id);
  return ok(res, data);
};

export const postAnggota = (req, res) => {
  const data = createAnggota(req.body);
  return ok(res, data, 'Anggota ditambahkan', 201);
};

export const putAnggota = (req, res) => {
  const data = updateAnggota(req.params.id, req.body);
  return ok(res, data, 'Anggota diperbarui');
};

export const removeAnggota = (req, res) => {
  const data = deleteAnggota(req.params.id);
  return ok(res, data, 'Anggota dihapus');
};
