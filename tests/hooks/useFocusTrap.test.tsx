import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useFocusTrap } from '@/hooks/useFocusTrap';

function FocusTrapHarness({
  initialOpen = false,
  withCustomInitialFocus = false,
  empty = false,
  onEscape = () => {},
}: {
  initialOpen?: boolean;
  withCustomInitialFocus?: boolean;
  empty?: boolean;
  onEscape?: () => void;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [showTrigger, setShowTrigger] = useState(true);
  const trapRef = useRef<HTMLDivElement>(null);
  const secondButtonRef = useRef<HTMLButtonElement>(null);
  const fallbackRef = useRef<HTMLDivElement>(null);

  useFocusTrap({
    active: open,
    containerRef: trapRef,
    onEscape: () => {
      onEscape();
      setOpen(false);
    },
    initialFocusRef: withCustomInitialFocus ? secondButtonRef : undefined,
    fallbackFocusRef: fallbackRef,
  });

  return (
    <div ref={fallbackRef} data-testid="fallback-target" tabIndex={-1}>
      {showTrigger && (
        <button type="button" onClick={() => setOpen(true)}>
          Open Dialog
        </button>
      )}
      {open && (
        <div ref={trapRef} data-testid="trap-container" role="dialog" aria-modal="true" aria-label="Sample trap">
          {!empty && (
            <>
              <button type="button">First Action</button>
              <button type="button" disabled>
                Disabled Action
              </button>
              <button type="button" hidden>
                Hidden Action
              </button>
              <button type="button" tabIndex={-1}>
                Programmatic Only
              </button>
              <button ref={secondButtonRef} type="button">
                Second Action
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowTrigger(false);
                  setOpen(false);
                }}
              >
                Detach Trigger And Close
              </button>
              <a href="#last">Last Link</a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

describe('useFocusTrap', () => {
  it('places initial focus inside the container and cycles Tab / Shift+Tab skipping non-tabbable elements', async () => {
    const user = userEvent.setup();
    render(<FocusTrapHarness />);

    const trigger = screen.getByRole('button', { name: 'Open Dialog' });
    await user.click(trigger);

    const first = screen.getByRole('button', { name: 'First Action' });
    const second = screen.getByRole('button', { name: 'Second Action' });
    const last = screen.getByRole('link', { name: 'Last Link' });

    expect(first).toHaveFocus();

    await user.tab();
    expect(second).toHaveFocus();

    await user.tab();
    await user.tab();
    expect(last).toHaveFocus();

    await user.tab();
    expect(first).toHaveFocus();

    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it('supports initialFocusRef when provided', async () => {
    const user = userEvent.setup();
    render(<FocusTrapHarness withCustomInitialFocus />);

    await user.click(screen.getByRole('button', { name: 'Open Dialog' }));
    expect(screen.getByRole('button', { name: 'Second Action' })).toHaveFocus();
  });

  it('invokes onEscape callback and restores focus to the previous trigger', async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<FocusTrapHarness onEscape={onEscape} />);

    const trigger = screen.getByRole('button', { name: 'Open Dialog' });
    await user.click(trigger);
    expect(screen.getByTestId('trap-container')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('trap-container')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('handles empty focusable containers safely without crashing', async () => {
    const user = userEvent.setup();
    render(<FocusTrapHarness empty />);

    await user.click(screen.getByRole('button', { name: 'Open Dialog' }));
    const container = screen.getByTestId('trap-container');
    expect(container).toHaveFocus();

    await user.tab();
    expect(container).toHaveFocus();
  });

  it('removes keydown listeners cleanly on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');
    const onEscape = vi.fn();

    const { unmount } = render(<FocusTrapHarness initialOpen onEscape={onEscape} />);

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('restores focus to fallbackFocusRef when original trigger is detached before close', async () => {
    const user = userEvent.setup();
    render(<FocusTrapHarness />);

    await user.click(screen.getByRole('button', { name: 'Open Dialog' }));
    await user.click(screen.getByRole('button', { name: 'Detach Trigger And Close' }));

    expect(screen.getByTestId('fallback-target')).toHaveFocus();
  });
});
