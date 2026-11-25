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
import { ThemeProvider } from '@/context/ThemeContext';
import type { ContactData, ProjectItem, SkillCategory } from '@/types/portfolio';

const ROOT_DIR = path.resolve(__dirname, '../..');

function renderWithProviders(ui: React.ReactElement, initialTheme: 'dark' | 'light' = 'dark') {
  window.localStorage.setItem('aj-portfolio-theme', initialTheme);
  document.documentElement.dataset.theme = initialTheme;
  return render(
    <ThemeProvider>
      <MotionPreferenceProvider>{ui}</MotionPreferenceProvider>
    </ThemeProvider>,
  );
}

describe('Phase 8 — Contrast, Accessibility, Responsiveness & SEO Hardening', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.dataset.theme = 'dark';
  });

  it('includes baseline SEO metadata in index.html and valid robots.txt without placeholder URLs', () => {
    const html = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<title>Austin Joshua — Portfolio</title>');
    expect(html).toMatch(/<meta\s+[^>]*name="description"[^>]*content="[^"]{30,}"/i);

    const robots = fs.readFileSync(path.join(ROOT_DIR, 'public/robots.txt'), 'utf8');
    expect(robots).toMatch(/User-agent:\s*\*/i);
    expect(robots).toMatch(/Allow:\s*\//i);
    expect(robots).not.toMatch(/localhost|127\.0\.0\.1|TBD|example\.com/i);
  });

  it('preserves locked Abyssal Teal core tokens, mobile scroll-padding-bottom, and @supports glass fallback', () => {
    const tokensCss = fs.readFileSync(
      path.join(ROOT_DIR, 'src/styles/tokens.css'),
      'utf8',
    );
    const glassCss = fs.readFileSync(
      path.join(ROOT_DIR, 'src/styles/glass.css'),
      'utf8',
    );
    const indexCss = fs.readFileSync(
      path.join(ROOT_DIR, 'src/styles/index.css'),
      'utf8',
    );

    expect(tokensCss).toContain('--surface-canvas: #061a1d;');
    expect(tokensCss).toContain('--accent-primary: #00d5c5;');
    expect(tokensCss).toContain('--accent-primary-deep: #126b75;');
    expect(tokensCss).toContain('--text-primary: #e8fffc;');
    expect(tokensCss).toContain('--gutter-mobile: 20px;');

    expect(glassCss).toContain('@supports ((backdrop-filter: blur(1px))');
    expect(indexCss).toContain('scroll-padding-top: var(--nav-offset);');
    expect(indexCss).toContain('scroll-padding-bottom: 5.5rem;');
  });

  it('renders mobile 6-column fixed bottom nav and desktop capsule with aria-hidden WebGL fallback and passes axe in both themes', async () => {
    for (const theme of ['dark', 'light'] as const) {
      const { container, unmount } = renderWithProviders(<App />, theme);

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
    }
  }, 15_000);

  it('keeps populated interactive Skills, Projects, and Contact accessible via keyboard in light theme', async () => {
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
      'light',
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
