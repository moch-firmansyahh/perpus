export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^08\d{7,12}$/;
export const ISBN_REGEX = /^[0-9-]{10,17}$/;

export const trimStr = (val) => (typeof val === 'string' ? val.trim() : '');

export const parseOptionalInt = (val) => {
  if (val === undefined || val === null || val === '') return undefined;
  const num = Number(val);
  return Number.isInteger(num) ? num : NaN;
};
