import { Inbox } from 'lucide-react';

export function EmptyState({ title = 'Belum ada data', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-ink-muted">
        <Inbox className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <p className="mt-3 font-heading text-sm font-semibold text-navy">{title}</p>
      {description && <p className="mt-1 max-w-md text-xs text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
