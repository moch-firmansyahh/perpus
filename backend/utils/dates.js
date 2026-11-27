const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const DENDA_PER_HARI = 2000;
export const DEFAULT_DURASI_HARI = 7;

export const addDaysISO = (baseDate, days) => {
  const d = new Date(baseDate.getTime() + days * MS_PER_DAY);
  return d.toISOString();
};

export const computeLateStats = (batasKembaliISO, referenceISO = new Date().toISOString()) => {
  const batas = new Date(batasKembaliISO).getTime();
  const ref = new Date(referenceISO).getTime();
  if (Number.isNaN(batas) || Number.isNaN(ref) || ref <= batas) {
    return { hariTerlambat: 0, denda: 0 };
  }
  const hariTerlambat = Math.max(0, Math.ceil((ref - batas) / MS_PER_DAY));
  return {
    hariTerlambat,
    denda: hariTerlambat * DENDA_PER_HARI,
  };
};
