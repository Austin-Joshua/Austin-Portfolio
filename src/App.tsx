import { LazyMotion, MotionConfig } from 'motion/react';
import { useEffect, useRef } from 'react';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { RootErrorBoundary } from '@/components/layout/RootErrorBoundary';
import { SkipLink } from '@/components/layout/SkipLink';
import { AboutSection } from '@/components/sections/AboutSection';
import { AchievementsSection } from '@/components/sections/AchievementsSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { profileData } from '@/data/profile';
import { parseSectionHash } from '@/data/sections';
import { scrollToSection } from '@/utils/scrollNavigation';

const loadMotionFeatures = () =>
  import('@/motion/motionFeatures').then((module) => module.domMax);

export function App() {
  const scrollProgressRef = useRef<number>(0);
  const { prefersReducedMotion } = useMotionPreference();

  // Initial deep-link hash alignment after React mounts
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const initialSection = parseSectionHash(window.location.hash);
    if (!initialSection) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToSection(initialSection, {
        prefersReducedMotion: true,
        focusTarget: false,
        updateHash: false,
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  // Browser Back/Forward & hashchange section synchronization
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleHistoryNavigation = () => {
      const targetSection = parseSectionHash(window.location.hash);
      if (!targetSection) {
        return;
      }

      scrollToSection(targetSection, {
        prefersReducedMotion,
        focusTarget: false,
        updateHash: false,
      });
    };

    window.addEventListener('hashchange', handleHistoryNavigation);
    window.addEventListener('popstate', handleHistoryNavigation);
    return () => {
      window.removeEventListener('hashchange', handleHistoryNavigation);
      window.removeEventListener('popstate', handleHistoryNavigation);
    };
  }, [prefersReducedMotion]);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <RootErrorBoundary>
          <SkipLink />
          <Navbar
            resumeAsset={profileData.resume}
            scrollProgressRef={scrollProgressRef}
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="relative z-10 min-h-screen scroll-mt-[var(--nav-offset)]"
          >
            <HeroSection scrollProgressRef={scrollProgressRef} />
            <AboutSection />
            <SkillsSection />
            <ProjectsSection />
            <ExperienceSection />
            <AchievementsSection />
            <ContactSection />
          </main>
          <Footer />
        </RootErrorBoundary>
      </LazyMotion>
    </MotionConfig>
  );
}

export default App;
