const pad = (n, width = 3) => String(n).padStart(width, '0');

export const nextId = (prefix, list) => {
  const maxNum = list.reduce((max, item) => {
    const match = String(item.id || '').match(new RegExp(`^${prefix}-(\\d+)$`));
    if (!match) return max;
    const num = Number.parseInt(match[1], 10);
    return Number.isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `${prefix}-${pad(maxNum + 1)}`;
};

export const nextKodePeminjaman = (list, date = new Date()) => {
  const yyyy = date.getUTCFullYear();
  const mm = pad(date.getUTCMonth() + 1, 2);
  const ymPrefix = `PINJAM-${yyyy}${mm}-`;
  const maxSeq = list.reduce((max, item) => {
    const kode = String(item.kodePeminjaman || '');
    if (!kode.startsWith(ymPrefix)) return max;
    const num = Number.parseInt(kode.slice(ymPrefix.length), 10);
    return Number.isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `${ymPrefix}${pad(maxSeq + 1)}`;
};
