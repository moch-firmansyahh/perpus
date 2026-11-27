import { AppError } from '../utils/response.js';

export const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError(401, 'Autentikasi diperlukan'));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError(403, 'Anda tidak memiliki izin untuk aksi ini'));
  }
  return next();
};
