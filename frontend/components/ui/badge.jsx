import { cn } from '@/lib/utils';

const TONE_CLASSES = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-blue-50 text-blue-600',
  neutral: 'bg-gray-100 text-ink-muted',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-heading text-xs font-medium',
        TONE_CLASSES[tone] || TONE_CLASSES.neutral,
        className
      )}
    >
      {children}
    </span>
  );
}
