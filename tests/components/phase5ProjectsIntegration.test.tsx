import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import type { ProjectItem } from '@/types/portfolio';

const PROJECTS: ProjectItem[] = [
  {
    slug: 'lattice-sim',
    indexCode: 'P-01',
    title: 'Lattice Sim',
    category: 'interactive-3d',
    categoryLabel: 'Interactive / 3D',
    summary: 'Orbital lattice simulation.',
    role: 'Author',
    stack: ['TypeScript', 'Three.js'],
    problem: 'Frame-budget scaling.',
    approach: 'Procedural buffer geometry.',
    links: {
      github: 'https://github.com/example/lattice-sim',
      live: null,
    },
  },
  {
    slug: 'signal-audit',
    indexCode: 'P-02',
    title: 'Signal Audit',
    category: 'ai-ml',
    categoryLabel: 'AI / ML',
    summary: 'Deterministic telemetry auditor.',
    role: 'Research Engineer',
    stack: ['Python'],
    problem: 'Noisy anomaly detection.',
    approach: 'Calibrated quantile filtering.',
    links: {
      github: null,
      live: 'https://audit.example.com',
    },
  },
];

describe('Phase 5 ProjectsSection Modal + URL Integration', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('opens matching modal from card, syncs ?project= URL, preserves filters, keeps external links independent, and restores focus on close', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MotionPreferenceProvider>
        <ProjectsSection projects={PROJECTS} />
      </MotionPreferenceProvider>,
    );

    // Clicking external GitHub link must not open modal
    const externalLink = screen.getAllByRole('link', { name: 'GitHub' })[0];
    await user.click(externalLink);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Category filter continues working
    await user.click(screen.getByRole('button', { name: 'AI / ML' }));
    expect(screen.queryByText('Lattice Sim')).not.toBeInTheDocument();
    expect(screen.getAllByText('Signal Audit').length).toBeGreaterThanOrEqual(1);

    const triggerBtn = screen.getByRole('button', {
      name: 'Inspect Details — Signal Audit',
    });
    await user.click(triggerBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('Signal Audit');
    expect(window.location.search).toBe('?project=signal-audit');
    expect(window.location.hash).toBe('#projects');
    expect(await axe(dialog)).toHaveNoViolations();

    // Closing via Escape restores clean URL and trigger button focus
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#projects');
    expect(triggerBtn).toHaveFocus();
    expect(container.querySelector('form')).toBeNull();
  });

  it('handles invalid deep links safely even when projects dataset is empty', async () => {
    window.history.replaceState(null, '', '/?project=non-existent');
    const user = userEvent.setup();

    render(
      <MotionPreferenceProvider>
        <ProjectsSection projects={[]} />
      </MotionPreferenceProvider>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('#projects');
    expect(screen.getByText('No projects added yet.')).toBeInTheDocument();

    const notice = screen.getByTestId('invalid-project-notice');
    expect(within(notice).getByRole('status')).toHaveTextContent(/not found/i);

    await user.click(
      within(notice).getByRole('button', { name: /Dismiss invalid project/i }),
    );
    expect(screen.queryByTestId('invalid-project-notice')).not.toBeInTheDocument();
  });
});
