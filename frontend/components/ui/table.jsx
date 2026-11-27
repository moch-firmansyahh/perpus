import { cn } from '@/lib/utils';

export function Table({ className, children }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full border-collapse text-left text-sm', className)}>{children}</table>
    </div>
  );
}

export function TableHead({ children }) {
  return <thead className="border-b border-ink-line bg-cream/70">{children}</thead>;
}

export function TableRow({ className, children }) {
  return (
    <tr className={cn('border-b border-ink-line last:border-0 hover:bg-cream/40', className)}>
      {children}
    </tr>
  );
}

export function TableHeaderCell({ className, children }) {
  return (
    <th
      className={cn(
        'whitespace-nowrap px-4 py-3 font-heading text-xs font-semibold uppercase tracking-wide text-ink-muted',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ className, children }) {
  return <td className={cn('px-4 py-3.5 align-middle text-ink', className)}>{children}</td>;
}
