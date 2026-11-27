import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TONE_BOX = {
  brand: 'bg-brand-soft text-brand',
  navy: 'bg-navy/10 text-navy',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  accent: 'bg-amber-100 text-amber-700',
};

export function StatCard({ icon: Icon, label, value, hint, tone = 'navy' }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-heading text-xs font-medium text-ink-muted">{label}</p>
          <p className="mt-1.5 font-heading text-2xl font-semibold text-navy">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        {Icon && (
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              TONE_BOX[tone] || TONE_BOX.navy
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
        )}
      </div>
    </Card>
  );
}
