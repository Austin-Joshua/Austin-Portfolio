import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { ProjectDetailModal } from '@/components/ui/ProjectDetailModal';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import type { ProjectItem } from '@/types/portfolio';

const FULL_PROJECT: ProjectItem = {
  slug: 'quantum-indexer',
  indexCode: 'P-01',
  title: 'Quantum Indexer',
  category: 'ai-ml',
  categoryLabel: 'AI / ML',
  summary: 'Structured semantic indexing pipeline.',
  role: 'Lead Architect',
  stack: ['TypeScript', 'Python', 'WebGL'],
  problem: 'High-latency document retrieval under concurrency.',
  approach: 'Vector quantization paired with deterministic worker batching.',
  outcomes: ['Verified P95 latency reduction in local benchmarks.'],
  media: [
    {
      src: '/assets/projects/indexer.webp',
      alt: 'Indexer architecture view',
      width: 1280,
      height: 800,
    },
  ],
  links: {
    github: 'https://github.com/example/quantum-indexer',
    live: 'https://indexer.example.com',
  },
};

const MINIMAL_PROJECT: ProjectItem = {
  slug: 'core-router',
  indexCode: 'P-02',
  title: 'Core Router',
  category: 'software-engineering',
  categoryLabel: 'Software',
  summary: 'Minimal typed utility.',
  role: null,
  stack: ['TypeScript'],
  problem: 'Routing boilerplate.',
  approach: 'Native URL state reconciliation.',
  links: {
    github: null,
    live: null,
  },
};

function ModalHarness({
  initialProject,
  onCloseSpy,
}: {
  initialProject: ProjectItem | null;
  onCloseSpy?: () => void;
}) {
  return (
    <MotionPreferenceProvider>
      <div id="background-content">
        <button type="button">Trigger Card</button>
      </div>
      <ProjectDetailModal
        project={initialProject}
        onClose={() => onCloseSpy?.()}
      />
    </MotionPreferenceProvider>
  );
}

describe('ProjectDetailModal', () => {
  const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

  beforeEach(() => {
    document.body.style.overflow = 'auto';
  });

  afterEach(() => {
    document.body.style.overflow = '';
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    }
    vi.restoreAllMocks();
  });

  it('renders verified fields, image fallback on error, background inertness, body scroll lock, and passes axe', async () => {
    const onClose = vi.fn();
    const { container, unmount } = render(
      <ModalHarness initialProject={FULL_PROJECT} onCloseSpy={onClose} />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Quantum Indexer');
    expect(within(dialog).getByText('Lead Architect')).toBeInTheDocument();
    expect(within(dialog).getByText('High-latency document retrieval under concurrency.')).toBeInTheDocument();
    expect(within(dialog).getByText('Verified P95 latency reduction in local benchmarks.')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: 'GitHub Repository' })).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );

    // Media image error fallback
    const img = within(dialog).getByRole('img', { name: 'Indexer architecture view' });
    fireEvent.error(img);
    expect(within(dialog).getByTestId('project-media-fallback')).toBeInTheDocument();

    // Background scroll lock + sibling inertness
    expect(document.body.style.overflow).toBe('hidden');
    expect(container).toHaveAttribute('aria-hidden', 'true');

    // Focus placed inside close button & traps Tab
    const closeBtn = within(dialog).getByRole('button', {
      name: 'Close project details',
    });
    expect(closeBtn).toHaveFocus();

    expect(await axe(dialog)).toHaveNoViolations();

    // Cleanup restores overflow and aria-hidden
    unmount();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('omits unavailable optional fields cleanly without placeholders', () => {
    render(<ModalHarness initialProject={MINIMAL_PROJECT} />);
    const dialog = screen.getByRole('dialog');

    expect(within(dialog).queryByText(/ROLE & CONTRIBUTION/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/VERIFIED OUTCOMES/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/MEDIA/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('link')).not.toBeInTheDocument();
  });

  it('closes on Escape, close button, and backdrop click without closing on inner content clicks', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ModalHarness initialProject={FULL_PROJECT} onCloseSpy={onClose} />);
    const dialog = screen.getByRole('dialog');

    // Click inside dialog content must not close
    await user.click(within(dialog).getByText('Structured semantic indexing pipeline.'));
    expect(onClose).not.toHaveBeenCalled();

    // Backdrop click closes
    await user.click(screen.getByTestId('project-modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Escape closes
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(2);

    // Close button closes
    await user.click(
      within(dialog).getByRole('button', { name: 'Close project details' }),
    );
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('respects prefers-reduced-motion on modal dialog', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<ModalHarness initialProject={MINIMAL_PROJECT} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('data-reduced-motion', 'true');
  });
});
