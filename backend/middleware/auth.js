import jwt from 'jsonwebtoken';
import { AppError } from '../utils/response.js';

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, 'JWT_SECRET belum dikonfigurasi pada server');
  }
  return secret;
};

export const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token autentikasi tidak ditemukan'));
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return next(new AppError(401, 'Token autentikasi kosong'));
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      anggotaId: decoded.anggotaId ?? null,
    };
    return next();
  } catch {
    return next(new AppError(401, 'Token tidak valid atau telah kedaluwarsa'));
  }
};
