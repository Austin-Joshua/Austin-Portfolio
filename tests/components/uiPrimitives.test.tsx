import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { RootErrorBoundary } from '@/components/layout/RootErrorBoundary';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { TagChip } from '@/components/ui/TagChip';

function ThrowingChild(): never {
  throw new Error('Sensitive internal stack error');
}

describe('T3.1 Shared UI Primitives', () => {
  it('renders Button variants, disabled/loading states, and passes axe', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <div>
        <Button variant="primary" onClick={onClick}>
          Primary Action
        </Button>
        <Button variant="secondary" size="sm">
          Secondary Action
        </Button>
        <Button variant="outline" disabled onClick={onClick}>
          Disabled Action
        </Button>
        <Button variant="ghost" loading onClick={onClick}>
          Loading Action
        </Button>
      </div>,
    );

    const primary = screen.getByRole('button', { name: 'Primary Action' });
    const disabled = screen.getByRole('button', { name: 'Disabled Action' });
    const loading = screen.getByRole('button', { name: 'Loading Action' });

    expect(primary).toHaveAttribute('type', 'button');
    expect(disabled).toBeDisabled();
    expect(loading).toBeDisabled();
    expect(loading).toHaveAttribute('aria-busy', 'true');

    await user.click(primary);
    await user.click(disabled);
    await user.click(loading);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders GlassCard with configurable semantic element and surface variant', () => {
    render(
      <GlassCard as="article" variant="strong" padding="lg" data-testid="card">
        <h3>Card Heading</h3>
      </GlassCard>,
    );

    const card = screen.getByTestId('card');
    expect(card.tagName).toBe('ARTICLE');
    expect(card).toHaveClass('glass-surface-strong');
  });

  it('distinguishes static TagChip spans from interactive TagChip buttons', async () => {
    const user = userEvent.setup();
    const onTagClick = vi.fn();

    render(
      <div>
        <TagChip>TypeScript</TagChip>
        <TagChip variant="accent" selected onClick={onTagClick}>
          AI / ML
        </TagChip>
      </div>,
    );

    const staticTag = screen.getByText('TypeScript');
    expect(staticTag.tagName).toBe('SPAN');
    expect(screen.queryByRole('button', { name: 'TypeScript' })).not.toBeInTheDocument();

    const interactiveTag = screen.getByRole('button', { name: 'AI / ML' });
    expect(interactiveTag).toHaveAttribute('aria-pressed', 'true');

    await user.click(interactiveTag);
    expect(onTagClick).toHaveBeenCalledTimes(1);
  });

  it('renders LiveAnnouncer with polite/assertive aria-live semantics and updates', () => {
    const { rerender } = render(
      <LiveAnnouncer message="Email copied to clipboard." politeness="polite" />,
    );

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toHaveAttribute('aria-live', 'polite');
    expect(statusRegion).toHaveAttribute('aria-atomic', 'true');
    expect(statusRegion).toHaveTextContent('Email copied to clipboard.');
    expect(statusRegion).toHaveClass('sr-only');

    rerender(
      <LiveAnnouncer message="Project slug not found." politeness="assertive" visible />,
    );

    const alertRegion = screen.getByRole('alert');
    expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
    expect(alertRegion).not.toHaveClass('sr-only');
  });

  it('catches render errors in RootErrorBoundary without exposing error details and passes axe', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onReset = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <RootErrorBoundary onReset={onReset}>
        <ThrowingChild />
      </RootErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /Austin Joshua — Portfolio/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Sensitive internal stack error/i)).not.toBeInTheDocument();

    const reloadButton = screen.getByRole('button', { name: 'Reload Page' });
    expect(reloadButton).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    await user.click(reloadButton);
    expect(onReset).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });
});
