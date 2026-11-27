import {
  createBuku,
  deleteBuku,
  getBukuById,
  listBuku,
  updateBuku,
} from '../services/buku.service.js';
import { ok } from '../utils/response.js';

export const getAllBuku = (req, res) => {
  const data = listBuku({
    search: req.query.search,
    kategori: req.query.kategori,
  });
  return ok(res, data, 'OK', 200, { meta: { total: data.length } });
};

export const getOneBuku = (req, res) => {
  const data = getBukuById(req.params.id);
  return ok(res, data);
};

export const postBuku = (req, res) => {
  const data = createBuku(req.body);
  return ok(res, data, 'Buku ditambahkan', 201);
};

export const putBuku = (req, res) => {
  const data = updateBuku(req.params.id, req.body);
  return ok(res, data, 'Buku diperbarui');
};

export const removeBuku = (req, res) => {
  const data = deleteBuku(req.params.id);
  return ok(res, data, 'Buku dihapus');
};
