'use client';

import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

export function FormDialog({
  open,
  onClose,
  title,
  description,
  onSubmit,
  loading = false,
  submitLabel = 'Simpan',
  children,
  maxWidth = 'max-w-2xl',
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth={maxWidth}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.();
        }}
        className="space-y-4"
      >
        {children}
        <div className="flex items-center justify-end gap-2.5 border-t border-ink-line pt-4">
          <Button type="button" variant="neutral" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
