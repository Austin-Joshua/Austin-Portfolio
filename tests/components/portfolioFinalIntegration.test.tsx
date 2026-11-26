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
import { achievementsData } from '@/data/achievements';
import { projectsData } from '@/data/projects';
import { PORTFOLIO_SECTIONS, buildSectionUrl, parseSectionHash } from '@/data/sections';
import { skillsData } from '@/data/skills';
import { scrollToSection } from '@/utils/scrollNavigation';
import { getProjectsForSkill } from '@/utils/skillCrossRef';

function renderWithProviders(ui: React.ReactElement) {
  return render(<MotionPreferenceProvider>{ui}</MotionPreferenceProvider>);
}

describe('AJ Cosmic Universe — Final Integration Audit', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.localStorage.clear();
    window.localStorage.setItem('aj-cosmic-intro-seen', '1');
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('renders redesigned minimal Navbar with AJ logo only, zero Cosmic Universe label, and zero download link', async () => {
    const { container } = renderWithProviders(<Navbar />);

    expect(screen.queryByText(/AJ \/\//i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cosmic Universe/i)).not.toBeInTheDocument();
    const emblems = screen.getAllByRole('img', { name: 'AJ' });
    expect(emblems[0]).toHaveAttribute('src', '/assets/brand/aj-emblem.png');

    expect(document.querySelector('header a[download]')).toBeNull();
    expect(screen.queryByRole('button', { name: /Switch to/i })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('mounts persistent cosmic UniverseLayer across App and renders SolarSystemHud + Hero portrait stage', () => {
    renderWithProviders(<App />);

    const heroSection = document.getElementById('hero');
    expect(heroSection).toHaveAttribute('aria-labelledby', 'hero-heading');

    const fallbacks = screen.getAllByTestId('universe-fallback');
    expect(fallbacks).toHaveLength(1);
    expect(fallbacks[0]).toHaveAttribute('aria-hidden', 'true');

    const stage = screen.getByTestId('hero-3d-stage');
    expect(heroSection).toContainElement(stage);
    expect(stage).toContainElement(screen.getByTestId('hero-portrait-figure'));

    const hud = screen.getByTestId('solar-system-hud');
    expect(heroSection).toContainElement(hud);
    expect(within(hud).getByTestId('planet-nav-sun')).toBeInTheDocument();
    for (const id of ['about', 'skills', 'projects', 'experience', 'achievements', 'contact']) {
      expect(within(hud).getByTestId(`planet-nav-${id}`)).toBeInTheDocument();
    }
  });

  it('serves genuine transparent RGBA cutout PNG and preserves source photo outside public/', () => {
    const cutoutPath = resolve(process.cwd(), 'public/assets/portrait/austin-joshua-cutout.png');
    expect(existsSync(cutoutPath)).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/assets/portrait/austin-joshua.jpg'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/assets/source/austin-joshua.jpg'))).toBe(true);

    const buf = readFileSync(cutoutPath);
    expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(buf.readUInt32BE(16)).toBe(604);
    expect(buf.readUInt32BE(20)).toBe(806);
    expect(buf[25]).toBe(6);
  });

  it('keeps Hero portrait shadow silhouette, hover, keyboard Tab/Enter/Space pinning, and blur states coherent', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <button type="button">Before Focus Target</button>
        <HeroSection />
        <button type="button">Outside Focus Target</button>
      </>,
    );

    const figure = screen.getByTestId('hero-portrait-figure');
    const toggleBtn = screen.getByTestId('portrait-reveal-toggle');
    const beforeBtn = screen.getByRole('button', { name: 'Before Focus Target' });
    const img = within(figure).getByRole('img', { name: /Austin Joshua/i });

    expect(img).toHaveAttribute('src', '/assets/portrait/austin-joshua-cutout.png');
    expect(figure).toHaveAttribute('data-portrait-revealed', 'false');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.pointerEnter(figure, { pointerType: 'mouse' });
    expect(figure).toHaveAttribute('data-portrait-revealed', 'true');
    fireEvent.pointerLeave(figure, { pointerType: 'mouse' });
    expect(figure).toHaveAttribute('data-portrait-revealed', 'false');

    beforeBtn.focus();
    await user.tab();
    expect(toggleBtn).toHaveFocus();
    expect(figure).toHaveAttribute('data-portrait-revealed', 'true');

    await user.keyboard('{Enter}');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(toggleBtn).toHaveFocus();
    expect(figure).toHaveAttribute('data-portrait-revealed', 'true');

    await user.tab();
    expect(figure).toHaveAttribute('data-portrait-revealed', 'false');
  });

  it('renders consistent brand icons in Hero, Contact, and Footer and keeps verified achievements backed by projects/resume', () => {
    expect(achievementsData).toHaveLength(3);

    renderWithProviders(
      <>
        <HeroSection />
        <ContactSection />
        <Footer />
      </>,
    );

    const githubLinks = screen.getAllByRole('link', { name: /Austin Joshua on GitHub/i });
    const linkedinLinks = screen.getAllByRole('link', { name: /Austin Joshua on LinkedIn/i });
    expect(githubLinks).toHaveLength(1); // Authoritative single Contact channel dock only
    expect(linkedinLinks).toHaveLength(1);
    expect(document.querySelector('#hero a[href*="github.com"]')).toBeNull();
    expect(document.querySelector('footer a[href*="github.com"]')).toBeNull();
    expect(document.querySelector('footer a[href="#hero"]')).toBeNull();
  });

  it('verifies curated project worlds cross-reference verified skills and open deep links', async () => {
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
