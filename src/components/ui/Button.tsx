import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-primary)] text-[var(--text-on-accent)] border border-transparent font-semibold hover:brightness-110 active:brightness-95 shadow-[var(--shadow-glass)]',
  secondary:
    'glass-surface text-[var(--text-primary)] font-medium hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)]',
  outline:
    'bg-transparent text-[var(--text-primary)] border border-[var(--border-glass)] font-medium hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] border border-transparent font-medium hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-[44px] md:min-h-[36px] min-w-[44px] px-3 py-1.5 text-sm gap-1.5',
  md: 'min-h-[44px] min-w-[44px] px-4 py-2.5 text-sm gap-2',
  lg: 'min-h-[48px] min-w-[44px] px-6 py-3 text-base gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center rounded-[var(--radius-control)]',
        'select-none whitespace-nowrap cursor-pointer',
        'transition-[background-color,border-color,color,box-shadow,filter] duration-[var(--transition-theme)]',
        'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <Loader2
          className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        leftIcon && (
          <span className="inline-flex shrink-0 items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}
      <span>{children}</span>
      {!loading && rightIcon && (
        <span className="inline-flex shrink-0 items-center" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
