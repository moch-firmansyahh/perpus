'use client';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Konfirmasi Aksi',
  message,
  confirmLabel = 'Ya, Lanjutkan',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-sm text-ink-muted">{message}</p>
      <div className="mt-6 flex items-center justify-end gap-2.5">
        <Button type="button" variant="neutral" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button
          type="button"
          variant={variant === 'danger' ? 'primary' : 'outline'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
