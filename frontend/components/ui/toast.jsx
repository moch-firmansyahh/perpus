'use client';

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STYLES = {
  success: 'border-success/30 bg-white text-ink',
  error: 'border-danger/30 bg-white text-ink',
  info: 'border-navy/20 bg-white text-ink',
};

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />,
  error: <AlertCircle className="h-5 w-5 shrink-0 text-danger" />,
  info: <Info className="h-5 w-5 shrink-0 text-blue-600" />,
};

export function ToastItem({ toast, onDismiss }) {
  return (
    <div
      role="status"
      className={cn(
        'flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg transition-all',
        STYLES[toast.type] || STYLES.info
      )}
    >
      {ICONS[toast.type] || ICONS.info}
      <div className="flex-1 text-sm">
        {toast.title && <p className="font-heading font-semibold text-navy">{toast.title}</p>}
        <p className="text-xs text-ink-muted">{toast.message}</p>
      </div>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        onClick={() => onDismiss(toast.id)}
        className="rounded p-0.5 text-ink-muted hover:bg-cream hover:text-ink"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
