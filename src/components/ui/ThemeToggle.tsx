import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const activeLabel = isDark ? 'Abyssal' : 'Crimson';
  const accessibleName = isDark
    ? 'Abyssal active — Switch to Crimson Void light theme'
    : 'Crimson active — Switch to Abyssal Teal dark theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={accessibleName}
      aria-pressed={!isDark}
      className={[
        'glass-surface inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2',
        'px-3 py-2 text-xs font-mono font-medium text-[var(--text-primary)]',
        'rounded-[var(--radius-control)] cursor-pointer select-none',
        'transition-[background-color,border-color,color,box-shadow] duration-[var(--transition-theme)]',
        'hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)]',
        'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isDark ? (
        <Moon className="size-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
      ) : (
        <Sun className="size-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
      )}
      <span>{activeLabel}</span>
    </button>
  );
}
