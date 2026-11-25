import type { HTMLAttributes, ReactNode } from 'react';

export type GlassCardElement = 'div' | 'article' | 'section' | 'aside' | 'li';
export type GlassCardVariant = 'default' | 'strong' | 'elevated' | 'cinematic';
export type GlassCardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface GlassCardProps extends HTMLAttributes<HTMLElement> {
  as?: GlassCardElement;
  variant?: GlassCardVariant;
  padding?: GlassCardPadding;
  interactive?: boolean;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<GlassCardVariant, string> = {
  default: 'glass-surface',
  strong: 'glass-surface-strong',
  elevated: 'surface-elevated-fallback',
  cinematic: 'glass-card-cinematic',
};

const PADDING_CLASSES: Record<GlassCardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-6 md:p-8',
};

export function GlassCard({
  as: Component = 'div',
  variant = 'default',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...rest
}: GlassCardProps) {
  return (
    <Component
      className={[
        'text-[var(--text-primary)]',
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        interactive
          ? 'cursor-pointer transition-[background-color,border-color,box-shadow,transform] duration-200 hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)] hover:-translate-y-0.5'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Component>
  );
}
