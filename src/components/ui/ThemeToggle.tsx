import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const accessibleName = isDark
    ? 'Midnight Amethyst active — Switch to Scarlet Porcelain light theme'
    : 'Scarlet Porcelain active — Switch to Midnight Amethyst dark theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={accessibleName}
      title={accessibleName}
      aria-pressed={!isDark}
      className={[
        'inline-flex min-h-[44px] min-w-[44px] items-center justify-center',
        'rounded-[var(--radius-control)] cursor-pointer select-none',
        'text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-card)]',
        'transition-[background-color,color] duration-[var(--transition-theme)]',
        'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isDark ? (
        <Moon className="size-5 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
      ) : (
        <Sun className="size-5 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
      )}
    </button>
  );
}
