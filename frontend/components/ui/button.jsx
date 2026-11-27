'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VARIANT_CLASSES = {
  primary: 'bg-brand text-white hover:bg-brand-hover focus-visible:ring-brand',
  secondary: 'bg-navy text-white hover:bg-navy-700 focus-visible:ring-navy',
  outline:
    'border border-success text-success bg-white hover:bg-success-soft focus-visible:ring-success',
  neutral:
    'border border-ink-line bg-white text-ink hover:bg-cream focus-visible:ring-navy-500',
  danger:
    'border border-danger text-danger bg-white hover:bg-danger-soft focus-visible:ring-danger',
  ghost: 'text-ink-muted hover:bg-cream hover:text-ink focus-visible:ring-navy-500',
};

const SIZE_CLASSES = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-5 text-sm rounded-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-heading font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-55 disabled:pointer-events-none',
        VARIANT_CLASSES[variant] || VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
