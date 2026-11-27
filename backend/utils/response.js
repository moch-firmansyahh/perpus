export const ok = (res, data, message = 'OK', status = 200, extra = {}) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    ...extra,
  });
};

export class AppError extends Error {
  constructor(status, message, errors = null) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
