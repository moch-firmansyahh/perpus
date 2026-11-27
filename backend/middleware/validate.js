import { AppError } from '../utils/response.js';

export const ensureBodyObject = (req, _res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(new AppError(400, 'Body permintaan harus berupa objek JSON'));
  }
  return next();
};
