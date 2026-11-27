import { Badge } from '@/components/ui/badge';

const STATUS_MAP = {
  DIPINJAM: { tone: 'warning', label: 'Dipinjam' },
  TERLAMBAT: { tone: 'danger', label: 'Terlambat' },
  DIKEMBALIKAN: { tone: 'success', label: 'Dikembalikan' },
  AKTIF: { tone: 'success', label: 'Aktif' },
  NONAKTIF: { tone: 'danger', label: 'Nonaktif' },
};

export function StatusBadge({ status }) {
  const key = String(status || '').toUpperCase();
  const cfg = STATUS_MAP[key] || { tone: 'neutral', label: status || '-' };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
