import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { App } from '@/App';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { ContactSection } from '@/components/sections/ContactSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { profileData } from '@/data/profile';
import { projectsData } from '@/data/projects';
import { PORTFOLIO_SECTIONS, buildSectionUrl, parseSectionHash } from '@/data/sections';
import { skillsData } from '@/data/skills';
import { scrollToSection } from '@/utils/scrollNavigation';
import { getProjectsForSkill } from '@/utils/skillCrossRef';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <MotionPreferenceProvider>{ui}</MotionPreferenceProvider>
    </ThemeProvider>,
  );
}

describe('Final Integration Audit — Navigation, Icons, 3D Hero, Data & Routing', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.localStorage.clear();
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('removes AJ brand text and renders icon-only ThemeToggle and Résumé download in Navbar', async () => {
    const { container } = renderWithProviders(
      <Navbar resumeAsset={profileData.resume} />,
    );

    expect(screen.queryByText(/AJ \/\//i)).not.toBeInTheDocument();

    const resumeLink = screen.getByRole('link', { name: /Download Résumé/i });
    expect(resumeLink).toHaveAttribute('href', '/assets/resume/Austin_Joshua_Resume.pdf');
    expect(resumeLink).toHaveAttribute('download', 'Austin_Joshua_Resume.pdf');
    expect(resumeLink.textContent?.trim()).toBe('');

    const themeBtn = screen.getByRole('button', {
      name: /Midnight Amethyst active — Switch to Scarlet Porcelain light theme/i,
    });
    expect(themeBtn.textContent?.trim()).toBe('');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('mounts a single UniverseLayer inside Hero 3D visual stage and associates hero-heading', () => {
    renderWithProviders(<App />);

    const heroSection = document.getElementById('hero');
    expect(heroSection).toHaveAttribute('aria-labelledby', 'hero-heading');

    const stage = screen.getByTestId('hero-3d-stage');
    expect(heroSection).toContainElement(stage);

    const fallbacks = screen.getAllByTestId('universe-fallback');
    expect(fallbacks).toHaveLength(1);
    expect(stage).toContainElement(fallbacks[0]);

    const heroPortrait = screen.getByTestId('hero-portrait-figure');
    expect(stage).toContainElement(heroPortrait);
  });

  it('serves a genuine transparent RGBA cutout PNG and preserves source photo outside public/', () => {
    const cutoutPath = resolve(process.cwd(), 'public/assets/portrait/austin-joshua-cutout.png');
    expect(existsSync(cutoutPath)).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/assets/portrait/austin-joshua.jpg'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/assets/source/austin-joshua.jpg'))).toBe(true);

    const buf = readFileSync(cutoutPath);
    // PNG magic header + IHDR RGBA color type (6)
    expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(buf.readUInt32BE(16)).toBe(604);
    expect(buf.readUInt32BE(20)).toBe(806);
    expect(buf[25]).toBe(6);
  });

  it('renders Hero portrait in shadow silhouette by default and keeps hover, keyboard focus, Enter/Space pinning, and blur states coherent', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <HeroSection />
        <button type="button">Outside Focus Target</button>
      </>,
    );

    const figure = screen.getByTestId('hero-portrait-figure');
    const toggleBtn = screen.getByTestId('portrait-reveal-toggle');
    const outsideBtn = screen.getByRole('button', { name: 'Outside Focus Target' });
    const img = within(figure).getByRole('img', { name: /Austin Joshua/i });

    expect(img).toHaveAttribute('src', '/assets/portrait/austin-joshua-cutout.png');
    expect(figure).toHaveAttribute('data-portrait-revealed', 'false');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(toggleBtn).toHaveAccessibleName(/Pin full-colour portrait preview/i);

    // 1. Pointer hover & leave stay independent of pinning
    fireEvent.pointerEnter(figure, { pointerType: 'mouse' });
    expect(figure).toHaveAttribute('data-portrait-revealed', 'true');
    fireEvent.pointerLeave(figure, { pointerType: 'mouse' });
    expect(figure).toHaveAttribute('data-portrait-revealed', 'false');

    // 2. Keyboard Tab focuses toggle -> stays revealed even across Enter/Space pin+unpin until blur leaves portrait
    const heroLinks = within(document.getElementById('hero')!).getAllByRole('link');
    heroLinks[heroLinks.length - 1].focus();
    await user.tab();
    expect(toggleBtn).toHaveFocus();
    expect(figure).toHaveAttribute('data-portrait-revealed', 'true');

    await user.keyboard('{Enter}');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(toggleBtn).toHaveAccessibleName(/Unpin full-colour portrait preview/i);
    expect(figure).toHaveAttribute('data-portrait-revealed', 'true');

    // Pressing Space unpins aria-pressed -> false, while keyboard focus STILL keeps portrait revealed
    await user.keyboard(' ');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(toggleBtn).toHaveFocus();
    expect(figure).toHaveAttribute('data-portrait-revealed', 'true');

    // Moving focus outside the portrait figure blurs and returns to silhouette
    await user.tab();
    expect(outsideBtn).toHaveFocus();
    expect(figure).toHaveAttribute('data-portrait-revealed', 'false');

    // 3. Pointer click pins across hover leave, then second click + leave returns to silhouette
    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.pointerLeave(figure, { pointerType: 'mouse' });
    expect(figure).toHaveAttribute('data-portrait-revealed', 'true');

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.pointerLeave(figure, { pointerType: 'mouse' });
    expect(figure).toHaveAttribute('data-portrait-revealed', 'false');
  });

  it('renders consistent brand SVG icons for GitHub, LinkedIn, and Email in Hero, Contact, and Footer without ExternalLink placeholders', () => {
    renderWithProviders(
      <>
        <HeroSection />
        <ContactSection />
        <Footer />
      </>,
    );

    const githubLinks = screen.getAllByRole('link', { name: /Austin Joshua on GitHub/i });
    const linkedinLinks = screen.getAllByRole('link', { name: /Austin Joshua on LinkedIn/i });

    expect(githubLinks).toHaveLength(2);
    expect(linkedinLinks).toHaveLength(2);

    for (const link of linkedinLinks) {
      const svg = link.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg?.classList.contains('lucide-external-link')).toBe(false);
    }

    const emailLinks = screen.getAllByRole('link', { name: /austinjoshuamj@gmail\.com/i });
    expect(emailLinks.length).toBeGreaterThanOrEqual(3);
  });

  it('verifies curated projects cross-reference verified skills and open real project deep links', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/?project=agriflux#projects');

    renderWithProviders(<ProjectsSection projects={projectsData} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAccessibleName('AgriFlux');
    expect(within(dialog).getByRole('link', { name: /GitHub Repository/i })).toHaveAttribute(
      'href',
      'https://github.com/Austin-Joshua/AgriFlux',
    );
    expect(within(dialog).getByRole('link', { name: /Live Demo/i })).toHaveAttribute(
      'href',
      'https://agri-flux-sandy.vercel.app',
    );

    // Every skill in skillsData maps to at least one real project
    for (const category of skillsData) {
      for (const skill of category.items) {
        expect(getProjectsForSkill(skill, projectsData).length).toBeGreaterThan(0);
      }
    }

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('preserves window.history.state and query string across scrollToSection and handles central hash helpers', () => {
    expect(parseSectionHash('#CONTACT')).toBe('contact');
    expect(parseSectionHash('#unknown')).toBeNull();
    expect(buildSectionUrl('skills', 'https://example.com/?project=agriflux#projects')).toBe(
      '/?project=agriflux#skills',
    );
    expect(PORTFOLIO_SECTIONS).toHaveLength(7);

    const aboutEl = document.createElement('section');
    aboutEl.id = 'about';
    aboutEl.scrollIntoView = vi.fn();
    document.body.append(aboutEl);

    try {
      window.history.replaceState({ projectSlug: 'agriflux', customTag: 42 }, '', '/?project=agriflux#projects');

      act(() => {
        scrollToSection('about', {
          prefersReducedMotion: true,
          updateHash: true,
        });
      });

      expect(window.location.search).toBe('?project=agriflux');
      expect(window.location.hash).toBe('#about');
      expect(window.history.state).toMatchObject({
        projectSlug: 'agriflux',
        customTag: 42,
        sectionId: 'about',
      });
    } finally {
      aboutEl.remove();
    }
  });
});
