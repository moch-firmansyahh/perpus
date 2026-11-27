import { getCurrentProfile, loginUser, registerMahasiswa } from '../services/auth.service.js';
import { ok } from '../utils/response.js';

export const register = (req, res) => {
  const result = registerMahasiswa(req.body);
  return ok(res, result, 'Registrasi berhasil', 201);
};

export const login = (req, res) => {
  const result = loginUser(req.body);
  return ok(res, result, 'Login berhasil', 200);
};

export const me = (req, res) => {
  const result = getCurrentProfile(req.user.id);
  return ok(res, result);
};
