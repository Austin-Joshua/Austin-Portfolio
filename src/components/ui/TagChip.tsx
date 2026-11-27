import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export type TagChipVariant = 'default' | 'accent' | 'gold' | 'copper';

interface BaseTagChipProps {
  variant?: TagChipVariant;
  selected?: boolean;
  className?: string;
  children: ReactNode;
}

export type StaticTagChipProps = BaseTagChipProps &
  Omit<HTMLAttributes<HTMLSpanElement>, keyof BaseTagChipProps | 'onClick'> & {
    onClick?: never;
  };

export type InteractiveTagChipProps = BaseTagChipProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseTagChipProps> & {
    onClick: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>;
  };

export type TagChipProps = StaticTagChipProps | InteractiveTagChipProps;

const VARIANT_CLASSES: Record<TagChipVariant, string> = {
  default:
    'bg-[var(--surface-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
  accent:
    'bg-[var(--surface-card)] text-[var(--accent-primary)] border-[var(--border-glass)]',
  gold: 'bg-[var(--surface-card)] text-[var(--accent-gold)] border-[var(--border-subtle)]',
  copper:
    'bg-[var(--surface-card)] text-[var(--accent-copper)] border-[var(--border-subtle)]',
};

export function TagChip(props: TagChipProps) {
  const {
    variant = 'default',
    selected = false,
    className = '',
    children,
    ...rest
  } = props;

  const baseClasses = [
    'type-meta inline-flex items-center rounded-[var(--radius-control)] border px-2.5 py-1',
    'leading-tight select-none',
    selected
      ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-[var(--accent-primary)] font-semibold'
      : VARIANT_CLASSES[variant],
    className,
  ];

  if ('onClick' in props && typeof props.onClick === 'function') {
    const { type = 'button', onClick, ...buttonRest } =
      rest as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        type={type}
        onClick={onClick}
        aria-pressed={selected}
        className={[
          ...baseClasses,
          'min-h-[44px] md:min-h-[28px] min-w-[28px] cursor-pointer',
          'transition-[background-color,border-color,color,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]',
          'hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]',
          'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        ]
          .filter(Boolean)
          .join(' ')}
        {...buttonRest}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={baseClasses.filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}
