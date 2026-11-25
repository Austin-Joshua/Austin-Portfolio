import { LazyMotion, MotionConfig } from 'motion/react';
import { useRef } from 'react';
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
import { profileData } from '@/data/profile';
import { UniverseLayer } from '@/three/UniverseLayer';

const loadMotionFeatures = () =>
  import('@/motion/motionFeatures').then((module) => module.domMax);

export function App() {
  const scrollProgressRef = useRef<number>(0);

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <RootErrorBoundary>
          <UniverseLayer scrollProgressRef={scrollProgressRef} />
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
            <HeroSection />
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
