import { LazyMotion, MotionConfig } from 'motion/react';
import { useEffect } from 'react';
import { CosmicIntroLoader } from '@/components/layout/CosmicIntroLoader';
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
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';
import {
  UniverseNavigationProvider,
  useUniverseNavigation,
} from '@/context/UniverseNavigationContext';
import {
  buildRouteTitle,
  buildSectionUrl,
  resolveLocationRoute,
} from '@/routes/routes';
import { UniverseLayer } from '@/three/UniverseLayer';
import { scrollToSection } from '@/utils/scrollNavigation';

const loadMotionFeatures = () =>
  import('@/motion/motionFeatures').then((module) => module.domMax);

function CosmicPortfolioShell() {
  const { scrollProgressRef } = useUniverseNavigation();

  // Initial route alignment & legacy hash/query normalization after React mounts
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const initialRoute = resolveLocationRoute();
    const targetSection = initialRoute.sectionId ?? 'hero';

    // Normalize legacy `/#section` or unknown routes cleanly without disrupting valid project routes
    if (!initialRoute.hasProjectParam && initialRoute.shouldCanonicalize) {
      window.history.replaceState(
        window.history.state,
        '',
        buildSectionUrl(targetSection),
      );
    }

    if (!initialRoute.hasProjectParam) {
      document.title = buildRouteTitle(targetSection);
    }

    if (targetSection === 'hero' && !initialRoute.hasProjectParam) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToSection(targetSection, {
        prefersReducedMotion: true,
        focusTarget: false,
        updateRoute: false,
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  // Browser Back/Forward & hashchange route synchronization
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleHistoryNavigation = () => {
      const nextRoute = resolveLocationRoute();
      const targetSection = nextRoute.sectionId ?? 'hero';

      if (!nextRoute.hasProjectParam) {
        if (nextRoute.shouldCanonicalize) {
          window.history.replaceState(
            window.history.state,
            '',
            buildSectionUrl(targetSection),
          );
        }
        document.title = buildRouteTitle(targetSection);
      }

      scrollToSection(targetSection, {
        prefersReducedMotion: true,
        focusTarget: false,
        updateRoute: false,
      });
    };

    window.addEventListener('hashchange', handleHistoryNavigation);
    window.addEventListener('popstate', handleHistoryNavigation);
    return () => {
      window.removeEventListener('hashchange', handleHistoryNavigation);
      window.removeEventListener('popstate', handleHistoryNavigation);
    };
  }, []);

  return (
    <RootErrorBoundary>
      <CosmicIntroLoader />
      <UniverseLayer />
      <SkipLink />
      <Navbar scrollProgressRef={scrollProgressRef} />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 pointer-events-none min-h-screen scroll-mt-[var(--nav-offset)]"
      >
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ExperienceSection />
        <AchievementsSection />
        <ContactSection />
      </main>
      <ScrollToTopButton />
      <Footer />
    </RootErrorBoundary>
  );
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <UniverseNavigationProvider>
          <CosmicPortfolioShell />
        </UniverseNavigationProvider>
      </LazyMotion>
    </MotionConfig>
  );
}

export default App;
