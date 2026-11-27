import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { App } from '@/App';
import { Navbar } from '@/components/layout/Navbar';
import { ContactSection } from '@/components/sections/ContactSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import type { ContactData, ProjectItem, SkillCategory } from '@/types/portfolio';

const ROOT_DIR = path.resolve(__dirname, '../..');

function renderWithProviders(ui: React.ReactElement) {
  return render(<MotionPreferenceProvider>{ui}</MotionPreferenceProvider>);
}

describe('Phase 8 — Cosmic Contrast, Accessibility, Responsiveness & SEO Hardening', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('aj-cosmic-intro-seen', '1');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('includes Cosmic Universe SEO metadata & favicons in index.html and valid robots.txt', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    expect(html).toContain('<html lang="en" data-theme="dark">');
    expect(html).toContain('<title>Austin Joshua — AJ Cosmic Universe</title>');
    expect(html).toContain('href="/favicon.png"');
    expect(html).toMatch(/<meta\s+[^>]*name="description"[^>]*content="[^"]{30,}"/i);

    const robots = fs.readFileSync(path.join(ROOT_DIR, 'public/robots.txt'), 'utf8');
    expect(robots).toMatch(/User-agent:\s*\*/i);
    expect(robots).toMatch(/Allow:\s*\//i);
    expect(robots).not.toMatch(/localhost|127\.0\.0\.1|TBD|example\.com/i);
  });

  it('enforces single permanent pitch-black cosmic tokens without light theme branches', () => {
    const tokensCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/tokens.css'), 'utf8');
    const glassCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/glass.css'), 'utf8');
    const indexCss = fs.readFileSync(path.join(ROOT_DIR, 'src/styles/index.css'), 'utf8');

    expect(tokensCss).toContain('--surface-canvas: #020307;');
    expect(tokensCss).toContain('--planet-sun: #ffb347;');
    expect(tokensCss).toContain('--planet-about: #38bdf8;');
    expect(tokensCss).toContain('--planet-skills: #818cf8;');
    expect(tokensCss).toContain('--planet-projects: #fb923c;');
    expect(tokensCss).toContain('--planet-experience: #2dd4bf;');
    expect(tokensCss).toContain('--planet-achievements: #facc15;');
    expect(tokensCss).toContain('--planet-contact: #f472b6;');
    expect(tokensCss).not.toContain("[data-theme='light']");
    expect(glassCss).not.toContain("[data-theme='light']");
    expect(indexCss).not.toContain("[data-theme='light']");

    expect(tokensCss).toContain('--gutter-mobile: 20px;');
    expect(glassCss).toContain('@supports ((backdrop-filter: blur(1px))');
    expect(indexCss).toContain('scroll-padding-top: var(--nav-offset);');
    expect(indexCss).toContain('scroll-padding-bottom: 5.5rem;');
  });

  it('renders mobile 6-column fixed bottom nav and desktop capsule with aria-hidden cosmic fallback and passes axe', async () => {
    const { container, unmount } = renderWithProviders(<App />);

    const mobileNav = screen.getByRole('navigation', {
      name: 'Mobile section navigation',
    });
    const mobileGrid = mobileNav.firstElementChild;
    expect(mobileGrid?.className).toContain('grid-cols-6');

    const fallback = screen.queryByTestId('universe-fallback');
    if (fallback) {
      expect(fallback).toHaveAttribute('aria-hidden', 'true');
    }

    expect(await axe(container)).toHaveNoViolations();
    unmount();
  }, 15_000);

  it('keeps populated interactive Skills, Projects, and Contact accessible via keyboard', async () => {
    const user = userEvent.setup();
    const categories: SkillCategory[] = [
      { id: 'sys', label: 'Systems', items: [{ id: 'rust', name: 'Rust' }] },
      { id: 'ml', label: 'AI / ML', items: [{ id: 'pt', name: 'PyTorch' }] },
    ];
    const projects: ProjectItem[] = [
      {
        slug: 'kernel-sim',
        indexCode: 'P-01',
        title: 'Kernel Simulator',
        category: 'systems',
        categoryLabel: 'Systems',
        summary: 'Memory-safe process scheduling explorer.',
        role: 'Engineer',
        stack: ['Rust', 'WebAssembly'],
        problem: 'Visibility into context switches.',
        approach: 'Deterministic step trace UI.',
        links: { github: 'https://github.com/example/kernel-sim', live: null },
      },
    ];
    const contact: ContactData = {
      headline: 'Reach out directly.',
      email: 'austin@example.com',
      availabilityNote: null,
      socialLinks: [
        {
          id: 'gh',
          platform: 'github',
          label: 'GitHub',
          url: 'https://github.com/example',
        },
      ],
    };

    const { container } = renderWithProviders(
      <>
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <SkillsSection categories={categories} projects={projects} />
          <ProjectsSection projects={projects} />
          <ContactSection contact={contact} />
        </main>
      </>,
    );

    const systemsTab = screen.getByRole('tab', { name: 'Systems' });
    await user.click(systemsTab);
    expect(systemsTab).toHaveAttribute('aria-selected', 'true');

    await user.click(screen.getByRole('button', { name: /Inspect Details — Kernel Simulator/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    expect(await axe(container)).toHaveNoViolations();
  });
});
