import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-ink-line bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn('border-b border-ink-line px-6 py-4', className)}>{children}</div>
  );
}

export function CardContent({ className, children }) {
  return <div className={cn('p-6', className)}>{children}</div>;
}
