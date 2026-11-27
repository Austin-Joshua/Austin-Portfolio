import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { App } from '@/App';
import { AboutSection } from '@/components/sections/AboutSection';
import { AchievementsSection } from '@/components/sections/AchievementsSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { HeroPortraitReveal } from '@/components/ui/HeroPortraitReveal';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import type {
  AchievementItem,
  ContactData,
  ExperienceItem,
  ProfileData,
  ProjectItem,
  SkillCategory,
} from '@/types/portfolio';

function renderWithProviders(ui: React.ReactElement) {
  return render(<MotionPreferenceProvider>{ui}</MotionPreferenceProvider>);
}

describe('Phase 4 Sections & Components', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(
    navigator,
    'clipboard',
  );

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    }
    vi.restoreAllMocks();
  });

  it('HeroSection & AboutSection handle pending fields and conditional resume CTA cleanly', () => {
    const pendingProfile: ProfileData = {
      name: 'Austin Joshua',
      roleLabel: null,
      heroTagline: null,
      aboutParagraphs: [],
      aboutPendingNotice: 'Verified narrative pending.',
      portrait: null,
      resume: null,
    };

    const { rerender } = renderWithProviders(
      <>
        <HeroSection profile={pendingProfile} />
        <AboutSection profile={pendingProfile} />
      </>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Austin Joshua' })).toBeInTheDocument();
    expect(screen.getByText('Verified narrative pending.')).toBeInTheDocument();
    expect(screen.getByText('ABOUT // PENDING_VERIFICATION')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Austin Joshua portrait/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Résumé/i })).not.toBeInTheDocument();

    const populatedProfile: ProfileData = {
      name: 'Austin Joshua',
      roleLabel: 'Computer Science Engineering',
      heroTagline: 'Building software and AI systems.',
      aboutParagraphs: ['Paragraph one narrative.', 'Paragraph two focus.'],
      aboutPendingNotice: 'Verified narrative pending.',
      portrait: { src: '/assets/portrait/austin.webp', alt: 'Austin Joshua portrait' },
      resume: { url: '/assets/resume/cv.pdf', label: 'Résumé', sizeLabel: '1.2 MB' },
    };

    rerender(
      <MotionPreferenceProvider>
        <HeroSection profile={populatedProfile} />
        <AboutSection profile={populatedProfile} />
      </MotionPreferenceProvider>,
    );

    expect(screen.getByText('Computer Science Engineering')).toBeInTheDocument();
    expect(screen.getByText('Building software and AI systems.')).toBeInTheDocument();
    expect(screen.getByText('Paragraph one narrative.')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Résumé/i })).toHaveLength(2);
    expect(screen.getAllByRole('img', { name: 'Austin Joshua portrait' })).toHaveLength(1);
    expect(document.querySelector('#about img')).toBeNull();
  });

  it('HeroPortraitReveal omits image cleanly if cutout asset fails to load', () => {
    render(
      <HeroPortraitReveal
        portrait={{ src: '/assets/portrait/missing.png', alt: 'Austin portrait' }}
        prefersReducedMotion={false}
      />,
    );

    const img = screen.getByRole('img', { name: 'Austin portrait' });
    fireEvent.error(img);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('SkillsSection supports keyboard tabs, cross-references projects, and renders neutral empty state', async () => {
    const user = userEvent.setup();
    const { rerender, container } = renderWithProviders(
      <SkillsSection categories={[]} projects={[]} />,
    );

    expect(screen.getByText('No skill categories added yet.')).toBeInTheDocument();

    const categories: SkillCategory[] = [
      {
        id: 'languages',
        label: 'Languages',
        items: [{ id: 'ts', name: 'TypeScript', projectSlugs: ['proj-a'] }],
      },
      {
        id: 'ai',
        label: 'AI / ML',
        items: [{ id: 'torch', name: 'PyTorch' }],
      },
    ];
    const projects: ProjectItem[] = [
      {
        slug: 'proj-a',
        indexCode: 'P-01',
        title: 'Spatial Console',
        category: 'software',
        categoryLabel: 'Software',
        summary: 'Summary text',
        role: null,
        stack: ['TypeScript'],
        problem: 'Problem',
        approach: 'Approach',
        links: { github: null, live: null },
      },
    ];

    rerender(
      <MotionPreferenceProvider>
        <SkillsSection categories={categories} projects={projects} />
      </MotionPreferenceProvider>,
    );

    const languagesTab = screen.getByRole('tab', { name: 'Languages' });
    languagesTab.focus();
    await user.keyboard('{ArrowRight}');

    const aiTab = screen.getByRole('tab', { name: 'AI / ML' });
    expect(aiTab).toHaveFocus();
    expect(aiTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByTestId('skill-atom-ts')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'All Molecules' }));
    await user.click(screen.getByTestId('skill-atom-ts'));

    const crossRef = screen.getByTestId('skill-cross-reference');
    expect(within(crossRef).getByRole('link', { name: /Spatial Console/i })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ProjectsSection handles filtering, aria-live announcements, empty filter reset, and external links', async () => {
    const user = userEvent.setup();
    const { rerender, container } = renderWithProviders(
      <ProjectsSection projects={[]} />,
    );

    expect(screen.getByText('No projects added yet.')).toBeInTheDocument();

    const sampleProjects: ProjectItem[] = [
      {
        slug: 'orbital-ui',
        indexCode: 'P-01',
        title: 'Orbital UI',
        category: 'software-engineering',
        categoryLabel: 'Software',
        summary: 'Design infrastructure.',
        role: 'Engineer',
        stack: ['TypeScript', 'React'],
        problem: 'Problem',
        approach: 'Approach',
        links: {
          github: 'https://github.com/example/orbital-ui',
          live: 'https://orbital.example.com',
        },
      },
    ];

    rerender(
      <MotionPreferenceProvider>
        <ProjectsSection
          projects={sampleProjects}
          categories={[
            { id: 'all', label: 'All' },
            { id: 'software-engineering', label: 'Software' },
            { id: 'ai-ml', label: 'AI / ML' },
          ]}
        />
      </MotionPreferenceProvider>,
    );

    const ghLink = screen.getAllByRole('link', { name: 'GitHub' })[0];
    expect(ghLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(ghLink).toHaveAttribute('target', '_blank');

    await user.click(screen.getByRole('button', { name: 'AI / ML' }));
    expect(screen.getByText('No projects match this filter.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No projects match AI / ML.');

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(screen.getAllByRole('heading', { level: 3, name: 'Orbital UI' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ExperienceSection & AchievementsSection render approved empty states and verified records cleanly', () => {
    const { rerender } = render(
      <>
        <ExperienceSection entries={[]} />
        <AchievementsSection items={[]} />
      </>,
    );

    expect(screen.getByText('No experience entries added yet.')).toBeInTheDocument();
    expect(screen.getByText('No achievements added yet.')).toBeInTheDocument();

    const exp: ExperienceItem[] = [
      {
        id: 'exp-1',
        role: 'Software Engineering Intern',
        organization: 'Example Org',
        period: '2025',
        locationOrMode: 'Remote',
        highlights: ['Delivered modular UI components.'],
      },
    ];
    const ach: AchievementItem[] = [
      {
        id: 'ach-1',
        title: 'Systems Recognition',
        issuer: 'Institute',
        date: '2025',
        verificationUrl: 'https://verify.example.com/cert',
      },
    ];

    rerender(
      <>
        <ExperienceSection entries={exp} />
        <AchievementsSection items={ach} />
      </>,
    );

    expect(screen.getByText('Software Engineering Intern')).toBeInTheDocument();
    expect(screen.getByText('Delivered modular UI components.')).toBeInTheDocument();
    const verifyLink = screen.getByRole('link', { name: /Verify Repository/i });
    expect(verifyLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('ContactSection renders mailto, Copy Email feedback/fallback, social links, and zero form elements', async () => {
    const user = userEvent.setup();
    const { rerender, container } = render(
      <ContactSection
        contact={{
          headline: null,
          email: null,
          availabilityNote: null,
          socialLinks: [],
        }}
      />,
    );

    expect(
      screen.getByText('Contact links will be published here prior to release.'),
    ).toBeInTheDocument();
    expect(container.querySelector('form')).toBeNull();

    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });

    const verifiedContact: ContactData = {
      headline: 'Open to engineering conversations.',
      email: 'austin@example.com',
      availabilityNote: 'Available for collaboration',
      socialLinks: [
        {
          id: 'github',
          platform: 'github',
          label: 'GitHub',
          url: 'https://github.com/example',
          handle: '@example',
        },
      ],
    };

    rerender(<ContactSection contact={verifiedContact} />);

    expect(screen.getByRole('link', { name: /austin@example\.com/i })).toHaveAttribute(
      'href',
      'mailto:austin@example.com',
    );
    expect(container.querySelector('form')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Copy Email' }));
    expect(writeTextMock).toHaveBeenCalledWith('austin@example.com');
    expect(screen.getByRole('status')).toHaveTextContent(/copied/i);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('full seven-section App passes vitest-axe without form fields or dialogs', async () => {
    const { container } = renderWithProviders(<App />);
    expect(container.querySelector('form')).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
