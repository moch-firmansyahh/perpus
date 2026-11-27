import { cn } from '@/lib/utils';

export function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-10 rounded-lg border bg-white px-3 text-sm text-ink placeholder:text-ink-muted transition-colors focus:outline-none focus:ring-2 focus:ring-navy/20',
        error ? 'border-danger focus:border-danger' : 'border-ink-line focus:border-navy',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, error, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full h-10 rounded-lg border bg-white px-3 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-navy/20',
        error ? 'border-danger focus:border-danger' : 'border-ink-line focus:border-navy',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function FormField({ label, required, error, htmlFor, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block font-heading text-xs font-medium text-navy">
          {label}
          {required && <span className="ml-0.5 text-brand">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
